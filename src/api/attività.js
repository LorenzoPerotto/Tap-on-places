import express from 'express';
import Activity from '../models/Activity.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

//ricerca attività per nome
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { nome } = req.query;

    if (!nome) {
      return res.status(400).json({ error: 'Il campo "nome" è obbligatorio' });
    }

    const activities = await Activity.find({
      nome: { $regex: nome, $options: 'i' }
    }).select('nome');

    if (activities.length === 0) {
      return res.status(404).json({ message: 'Nessuna attività trovata con questo nome' });
    }

    const result = activities.map(act => ({
      nome: act.nome,
      self: `/api/v1/attivita/${act._id}`
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero delle attività' });
  }
});

//dettagli attività
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const activityId = req.params.id;

    // trova l'attività nel database
    const activity = await Activity.findById(activityId).exec();

    if (!activity) {
      return res.status(404).json({ error: 'Attività non trovata' });
    }

    // costruisce l'oggetto di risposta con solo i campi visibili all'utente
    const dettaglio = {
      nome: activity.nome,
      tipo: activity.tipo,
      tipologia: activity.tipologia,
      tempo: activity.tempo,
      budget: activity.budget,
      descrizione: activity.descrizione,
    };

    res.status(200).json(dettaglio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero dell\'attività' });
  }
});

//salva attività
router.post('/salva/:id', authMiddleware, async (req, res) => {
  try {
    const user = req.user; 
    const activityId = req.params.id;

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ error: 'Attività non trovata' });
    }

    if (!user.savedActivities.includes(activityId)) {
      user.savedActivities.push(activityId);
      await user.save();
    }

    res.status(200).json({ message: 'Attività salvata con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel salvataggio dell\'attività' });
  }
});

export default router;






