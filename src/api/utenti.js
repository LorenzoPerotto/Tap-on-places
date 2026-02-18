import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendConfirmationCode } from '../utils/emailUtils.js'; // invio codice email
import { hashPassword, comparePassword } from '../utils/passwordUtils.js'; // cifratura password

const router = express.Router();

// Funzione di utilità: validazione email
function isValidEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

// Funzione di utilità: validazione password
function isSecurePassword(password) {
  // almeno 8 caratteri, 1 maiuscola, 1 minuscola, 1 numero, 1 simbolo
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return re.test(password);
}

// Registrazione
router.post('/', async (req, res) => {
  try {
    const { email, password, nickname, nome, cognome, dataNascita } = req.body;

    // validazione dei campi
    if (!email || !password || !nickname || !nome || !cognome || !dataNascita) {
      return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email non valida' });
    }

    if (!isSecurePassword(password)) {
      return res.status(400).json({
        error: 'Password non sicura: minimo 8 caratteri, almeno 1 maiuscola, 1 minuscola, 1 numero, 1 simbolo'
      });
    }

    // verifica se email o nickname esistono già
    const existingUser = await User.findOne({ $or: [{ email }, { nickname }] });
    if (existingUser) {
      return res.status(409).json({ error: 'Email o nickname già presenti' });
    }

    // genera codice a 4 cifre
    const codiceConferma = Math.floor(1000 + Math.random() * 9000);

    // cifra la password prima di salvare
    const hashedPassword = await hashPassword(password);

    // crea utente nello stato "non confermato"
    const newUser = new User({
      email,
      password: hashedPassword,
      nickname,
      nome,
      cognome,
      dataNascita,
      codiceConferma,
      confermato: false
    });

    await newUser.save();

    // invio codice via email (non blocca la registrazione se fallisce)
    let emailInviata = true;
    try {
      await sendConfirmationCode(email, codiceConferma);
    } catch (emailError) {
      console.error('Errore invio email di conferma:', emailError.message);
      emailInviata = false;
    }

    const message = emailInviata
      ? 'Registrazione avviata. Inserisci il codice a 4 cifre inviato via email per completare.'
      : 'Registrazione avviata. Non è stato possibile inviare l\'email di conferma. Controlla la configurazione SMTP.';

    res.status(201).json({
      message,
      emailInviata,
      codiceConferma,
      user: {
        self: `/api/v1/utenti/${newUser._id}`,
        email: newUser.email,
        nickname: newUser.nickname
      }
    });

  } catch (error) {
    console.error('Errore nella registrazione:', error.message);
    res.status(500).json({ error: `Errore nella registrazione: ${error.message}` });
  }
});

// Conferma registrazione
router.post('/conferma', async (req, res) => {
  try {
    const { email, codice } = req.body;

    if (!email || !codice) {
      return res.status(400).json({ error: 'Email e codice sono obbligatori' });
    }

    const user = await User.findOne({ email, codiceConferma: codice });

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato o codice errato' });
    }

    user.confermato = true;
    user.codiceConferma = null; // rimuove il codice
    await user.save();

    res.status(200).json({ message: 'Registrazione completata con successo' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nella conferma del codice' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // controllo che i campi siano stati inseriti
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password sono obbligatorie' });
    }

    // cerca l'utente nel DB
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(401).json({ error: 'Email o password non corretti' });
    }

    // login con conferma dell'email
    if (!user.confermato) {
      return res.status(403).json({ error: 'Account non confermato' });
    }

    // confronta password usando utils
    const passwordMatches = await comparePassword(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Email o password non corretti' });
    }

    // Genera token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // login avvenuto con successo
    res.status(200).json({
      message: 'Login avvenuto con successo',
      token,
      user: {
        self: `/api/v1/utenti/${user._id}`,
        nome: user.nome,
        cognome: user.cognome,
        nickname: user.nickname,
        email: user.email,
        isComunale: user.tipo === 'comunale'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Profilo utente autenticato
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      _id: user._id,
      nome: user.nome,
      cognome: user.cognome,
      nickname: user.nickname,
      email: user.email,
      isComunale: user.tipo === 'comunale',
      dataNascita: user.dataNascita
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero del profilo' });
  }
});

export default router;



