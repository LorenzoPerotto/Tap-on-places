import express from 'express';
import Activity from '../models/Activity.js';
import Itinerary from '../models/Itinerary.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { isComune } from '../middleware/role.js';

const router = express.Router();

// Helper function per confrontare ObjectId in modo sicuro
const compareIds = (id1, id2) => {
  return id1.toString() === id2.toString();
};

router.use(authMiddleware);
router.use(isComune);

// Ottieni tutte le informazioni dashboard comunale
router.get('/', async (req, res) => {
  try {
    const { specifiche } = req.query;

    const [attivita, itinerari, utenti] = await Promise.all([
      Activity.find().lean().exec(),
      Itinerary.find().populate('activities').lean().exec(),
      User.find().select('dataNascita savedActivities savedItineraries').lean().exec()
    ]);

    const informazioni = [];

    attivita.forEach(att => {
      const numPersone = utenti.filter(u => 
        u.savedActivities && u.savedActivities.some(id => compareIds(id, att._id))
      ).length;

      const utentiInteressati = utenti.filter(u => 
        u.savedActivities && 
        u.savedActivities.some(id => compareIds(id, att._id)) && 
        u.dataNascita
      );
      
      let etMedia = 0;
      if (utentiInteressati.length > 0) {
        const sommaEta = utentiInteressati.reduce((acc, u) => {
          const eta = new Date().getFullYear() - new Date(u.dataNascita).getFullYear();
          return acc + eta;
        }, 0);
        etMedia = Math.round(sommaEta / utentiInteressati.length);
      }

      informazioni.push({
        self: `/api/v1/informazioni/attivita/${att._id}`,
        tipo: 'attivita',
        nome: att.nome,
        categoria: att.tipo,
        tipologia: att.tipologia,
        numPersone,
        etMedia,
        orario: 'Non disponibile'
      });
    });

    itinerari.forEach(it => {
      const numPersone = utenti.filter(u => 
        u.savedItineraries && u.savedItineraries.some(id => compareIds(id, it._id))
      ).length;

      const utentiInteressati = utenti.filter(u => 
        u.savedItineraries && 
        u.savedItineraries.some(id => compareIds(id, it._id)) && 
        u.dataNascita
      );
      
      let etMedia = 0;
      if (utentiInteressati.length > 0) {
        const sommaEta = utentiInteressati.reduce((acc, u) => {
          const eta = new Date().getFullYear() - new Date(u.dataNascita).getFullYear();
          return acc + eta;
        }, 0);
        etMedia = Math.round(sommaEta / utentiInteressati.length);
      }

      informazioni.push({
        self: `/api/v1/informazioni/itinerario/${it._id}`,
        tipo: 'itinerario',
        nome: it.nome,
        tipologia: it.tipologia,
        tempo: it.tempo,
        budget: it.budget,
        numPersone,
        etMedia,
        orario: 'Non disponibile'
      });
    });

    
    let risultato = informazioni;
    if (specifiche) {
      risultato = informazioni.filter(info => 
        info.tipologia && info.tipologia.toLowerCase().includes(specifiche.toLowerCase())
      );
    }

    res.status(200).json(risultato);

  } catch (error) {
    console.error('Errore GET /informazioni:', error);
    res.status(500).json({ error: 'Errore nel recupero delle informazioni' });
  }
});

router.get('/statistiche-globali', async (req, res) => {
  try {
        const [totaleAttivita, totaleItinerari, utenti] = await Promise.all([
      Activity.countDocuments(),
      Itinerary.countDocuments(),
      User.find().select('dataNascita savedActivities savedItineraries').lean().exec()
    ]);

    const totaleUtenti = utenti.length;

    const totaleFavorites = utenti.reduce((acc, u) => {
      const numSaved = (u.savedActivities?.length || 0) + (u.savedItineraries?.length || 0);
      return acc + numSaved;
    }, 0);

    let etMediaGlobale = 0;
    const utentiConEta = utenti.filter(u => u.dataNascita);
    if (utentiConEta.length > 0) {
      const sommaEta = utentiConEta.reduce((acc, u) => {
        const eta = new Date().getFullYear() - new Date(u.dataNascita).getFullYear();
        return acc + eta;
      }, 0);
      etMediaGlobale = Math.round(sommaEta / utentiConEta.length);
    }

    const attivita = await Activity.find().lean().exec();
    const attivitaConConteggio = attivita.map(att => {
      const numSalvataggi = utenti.filter(u => 
        u.savedActivities && u.savedActivities.some(id => compareIds(id, att._id))
      ).length;
      return { 
        nome: att.nome,
        tipo: att.tipo,
        visite: numSalvataggi
      };
    });
    const topAttivita = attivitaConConteggio
      .sort((a, b) => b.visite - a.visite)
      .slice(0, 10);

    const itinerari = await Itinerary.find().lean().exec();
    const itinerariConConteggio = itinerari.map(it => {
      const numSalvataggi = utenti.filter(u => 
        u.savedItineraries && u.savedItineraries.some(id => compareIds(id, it._id))
      ).length;
      return {
        nome: it.nome,
        tipologia: it.tipologia,
        visite: numSalvataggi
      };
    });
    const topItinerari = itinerariConConteggio
      .sort((a, b) => b.visite - a.visite)
      .slice(0, 10);

    res.status(200).json({
      totalUsers: totaleUtenti,
      totalItineraries: totaleItinerari,
      totalActivities: totaleAttivita,
      totalFavorites: totaleFavorites,
      etMediaUtenti: etMediaGlobale,
      topAttivita,
      topItinerari
    });

  } catch (error) {
    console.error('Errore GET /statistiche-globali:', error);
    res.status(500).json({ error: 'Errore nel recupero delle statistiche globali' });
  }
});

router.get('/attivita/:id', async (req, res) => {
  try {
    const activityId = req.params.id;

    if (!activityId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ID attività non valido' });
    }

    const activity = await Activity.findById(activityId).lean().exec();
    if (!activity) {
      return res.status(404).json({ error: 'Attività non trovata' });
    }

    const utenti = await User.find()
      .select('dataNascita savedActivities')
      .lean()
      .exec();
    
    const numPersone = utenti.filter(u => 
      u.savedActivities && u.savedActivities.some(id => compareIds(id, activity._id))
    ).length;

    const utentiInteressati = utenti.filter(u => 
      u.savedActivities && 
      u.savedActivities.some(id => compareIds(id, activity._id)) && 
      u.dataNascita
    );
    
    let etMedia = 0;
    if (utentiInteressati.length > 0) {
      const sommaEta = utentiInteressati.reduce((acc, u) => {
        const eta = new Date().getFullYear() - new Date(u.dataNascita).getFullYear();
        return acc + eta;
      }, 0);
      etMedia = Math.round(sommaEta / utentiInteressati.length);
    }

    res.status(200).json({
      self: `/api/v1/informazioni/attivita/${activity._id}`,
      nome: activity.nome,
      tipo: activity.tipo,
      tipologia: activity.tipologia,
      numPersone,
      etMedia,
      orario: 'Non disponibile'
    });

  } catch (error) {
    console.error('Errore GET /informazioni/attivita/:id:', error);
    res.status(500).json({ error: 'Errore nel recupero delle informazioni' });
  }
});

router.get('/itinerario/:id', async (req, res) => {
  try {
    const itineraryId = req.params.id;

    if (!itineraryId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ID itinerario non valido' });
    }

    const itinerary = await Itinerary.findById(itineraryId)
      .populate('activities')
      .lean()
      .exec();
      
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerario non trovato' });
    }

    const utenti = await User.find()
      .select('dataNascita savedItineraries')
      .lean()
      .exec();
    
    const numPersone = utenti.filter(u => 
      u.savedItineraries && u.savedItineraries.some(id => compareIds(id, itinerary._id))
    ).length;

    const utentiInteressati = utenti.filter(u => 
      u.savedItineraries && 
      u.savedItineraries.some(id => compareIds(id, itinerary._id)) && 
      u.dataNascita
    );
    
    let etMedia = 0;
    if (utentiInteressati.length > 0) {
      const sommaEta = utentiInteressati.reduce((acc, u) => {
        const eta = new Date().getFullYear() - new Date(u.dataNascita).getFullYear();
        return acc + eta;
      }, 0);
      etMedia = Math.round(sommaEta / utentiInteressati.length);
    }

    res.status(200).json({
      self: `/api/v1/informazioni/itinerario/${itinerary._id}`,
      nome: itinerary.nome,
      tipologia: itinerary.tipologia,
      tempo: itinerary.tempo,
      budget: itinerary.budget,
      numPersone,
      etMedia,
      orario: 'Non disponibile'
    });

  } catch (error) {
    console.error('Errore GET /informazioni/itinerario/:id:', error);
    res.status(500).json({ error: 'Errore nel recupero delle informazioni' });
  }
});

export default router;
