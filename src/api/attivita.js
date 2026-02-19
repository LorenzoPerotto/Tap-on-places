import express from 'express';
import Activity from '../models/Activity.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

//ricerca attività per nome
router.get('/', async (req, res) => {
    try {
        const { nome } = req.query;

        // Se nome è fornito, filtra per nome; altrimenti restituisce tutte le attività
        const filter = nome ? { nome: { $regex: nome, $options: 'i' } } : {};

        const activities = await Activity.find(filter).select('nome tipo tipologia coordinate tempo budget descrizione');

        const result = activities.map(act => ({
            _id: act._id,
            nome: act.nome,
            tipo: act.tipo,
            tipologia: act.tipologia,
            coordinate: act.coordinate,
            tempo: act.tempo,
            budget: act.budget,
            descrizione: act.descrizione,
            self: `/api/v1/attivita/${act._id}`
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Errore nel recupero delle attività' });
    }
});

//dettagli attività
router.get('/:id', async (req, res) => {
    try {
        const activityId = req.params.id;

        // trova l'attività nel database
        const activity = await Activity.findById(activityId).exec();

        if (!activity) {
            return res.status(404).json({ error: 'Attività non trovata' });
        }

        // costruisce l'oggetto di risposta con solo i campi visibili all'utente
        const dettaglio = {
            _id: activity._id,
            nome: activity.nome,
            tipo: activity.tipo,
            tipologia: activity.tipologia,
            coordinate: activity.coordinate,
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
