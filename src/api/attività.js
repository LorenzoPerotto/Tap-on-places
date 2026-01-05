import express from 'express';
import Activity from '../models/activity.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

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
      self: `/api/v1/attività/${act._id}`
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero delle attività' });
  }
});

export default router;
