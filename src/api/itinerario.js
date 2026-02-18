import express from 'express';
import Itinerary from '../models/Itinerary.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

//ricerca itinerari tramite le preferenze 
router.get('/', async (req, res) => {
  try {
    const { tipologia, tempo, budget } = req.query;

    const filter = {};

    if (tipologia) {
      filter.tipologia = tipologia;
    }

    if (tempo) {
      filter.tempo = { $lte: Number(tempo) };
    }

    if (budget) {
      filter.budget = { $lte: Number(budget) };
    }

    const itinerari = await Itinerary.find(filter).exec();

    const lista = itinerari.map(it => ({
      nome: it.nome,
      self: `/api/v1/itinerari/${it._id}`
    }));

    res.status(200).json(lista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero degli itinerari' });
  }
});

//ricerca itinerario tramite nome
router.get('/search', async (req, res) => {
  try {
    const { nome } = req.query;

    if (!nome) {
      return res.status(400).json({ error: 'Il campo "nome" è obbligatorio' });
    }

    const itinerari = await Itinerary.find({
      nome: { $regex: nome, $options: 'i' }
    }).select('nome');

    const result = itinerari.map(it => ({
      nome: it.nome,
      self: `/api/v1/itinerari/${it._id}`
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero degli itinerari' });
  }
});

//specifiche itinerario
router.get('/:id', async (req, res) => {
  try {
    const it = await Itinerary.findById(req.params.id).exec();

    if (!it) {
      return res.status(404).json({ error: 'Itinerario non trovato' });
    }

    const dettagli = {
      nome: it.nome,
      tipologia: it.tipologia,
      tempo: it.tempo,
      budget: it.budget,
      descrizione: it.descrizione,
    };

    res.status(200).json(dettagli);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero dell\'itinerario' });
  }
});

//salva itinerario
router.post('/salva/:id', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const itineraryId = req.params.id;

    // trova itinerario
    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerario non trovato' });
    }

    // aggiunge l'itinerario salvato all'utente, se non già presente
    if (!user.savedItineraries.includes(itineraryId)) {
      user.savedItineraries.push(itineraryId);
      await user.save();
    }

    res.status(200).json({ message: 'Itinerario salvato con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel salvataggio dell\'itinerario' });
  }
});

//crea itinerario
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      nome,
      descrizione,
      tipologia,
      startPoint,
      endPoint,
      activities
    } = req.body;

    // Validazioni
    if (!nome || !descrizione || !tipologia || !startPoint || !endPoint) {
      return res.status(400).json({
        error: 'Nome, descrizione, tipologia, punto di inizio e fine sono obbligatori'
      });
    }

    if (!Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({
        error: 'Devi inserire almeno un’attività'
      });
    }

    // Verifica nome univoco
    const existing = await Itinerary.findOne({ nome });
    if (existing) {
      return res.status(409).json({
        error: 'Esiste già un itinerario con questo nome'
      });
    }

    const foundActivities = await Activity.find({
      _id: { $in: activities }
    });

    // Controllo che le attività esistano
    if (foundActivities.length !== activities.length) {
      return res.status(404).json({
        error: 'Una o più attività non esistono'
      });
    }

    // Calcolo tempo e budget
    let tempoTotale = 0;
    let budgetTotale = 0;

    foundActivities.forEach(act => {
      tempoTotale += act.tempo || 0;
      budgetTotale += act.budget || 0;
    });

    // Creazione itinerario
    const newItinerary = new Itinerary({
      nome,
      descrizione,
      tipologia,
      tempo: tempoTotale,
      budget: budgetTotale,
      creator: req.user._id, // utente loggato
      activities: activities
    });

    await newItinerary.save();

    res.status(201).json({
      message: 'Itinerario creato con successo',
      itinerary: {
        self: `/api/v1/itinerari/${newItinerary._id}`,
        nome: newItinerary.nome,
        tipologia: newItinerary.tipologia,
        tempo: newItinerary.tempo,
        budget: newItinerary.budget
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Errore nella creazione dell’itinerario'
    });
  }
});

export default router;








