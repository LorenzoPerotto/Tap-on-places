import express from 'express';
import Itinerary from '../models/itinerary.js'; 
import { authMiddleware } from '../middleware/auth.js'; 
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const itinerari = await Itinerary.find().exec();

    const lista = itinerari.map(it => ({
      self: `/api/v1/itinerari/${it._id}`, // link alle specifiche
      nome: it.nome,
    }));

    res.status(200).json(lista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero degli itinerari' });
  }
});


router.get('/', authMiddleware, async (req, res) => {
  try {
    const { nome } = req.query;

    let itinerari;

    if (nome) {
      itinerari = await Itinerary.find({
        nome: { $regex: nome, $options: 'i' } // ricerca case-insensitive
      }).select('nome');
    } else {
      itinerari = await Itinerary.find().select('nome');
    }

    const result = itinerari.map(it => ({
      nome: it.nome,
      self: `/api/v1/itinerari/${it._id}`
    }));

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero degli itinerari' });
  }
});


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

export default router;

