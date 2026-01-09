import express from 'express';
import Itinerary from '../models/Itinerary.js'; 
import User from '../models/user.js';
import { authMiddleware } from '../middleware/auth.js'; 

const router = express.Router();

//ricerca itinerari tramite le preferenze 
router.get('/', authMiddleware, async (req, res) => {
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
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { nome } = req.query;

    if (!nome) {
      return res.status(400).json({ error: 'Il campo "nome" è obbligatorio' });
    }

    const itinerari = await Itinerary.find({
      nome: { $regex: nome, $options: 'i' } 
    }).select('nome');

    if (itinerari.length === 0) {
      return res.status(404).json({ message: 'Nessun itinerario trovato con questo nome' });
    }

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
router.get('/:id', authMiddleware, async (req, res) => {
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

//salvataggio itinerario
router.post('/salva/:id', authMiddleware, async (req, res) => {
  try {
    const user = req.loggedUser; // recuperato dal middleware
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

export default router;






