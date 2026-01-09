import express from 'express';
import Activity from '../models/Activity.js';
import User from '../models/user.js';
import authMiddleware from '../middleware/authMiddleware.js';

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
      self: `/api/v1/attività/${act._id}`
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero delle attività' });
  }
});

//salva attività
router.post('/salva/:id', authMiddleware, async (req, res) => {
  try {
    const user = req.loggedUser; 
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


