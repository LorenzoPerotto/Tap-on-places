const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      unique: true
    },
    tipologia: {
      type: String
    },
    tempo: {
      type: Number // minuti
    },
    budget: {
      type: Number
    },
    descrizione: {
      type: String
    },

    // Relazione "crea"
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null = generato da AI
    },

    // Relazione "presenti"
    activities: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }
    ],

    // Dati aggregati per utenti comunali
    numPersone: {
      type: Number,
      default: 0
    },
    etaMedia: {
      type: Number
    },
    orarioAffluenza: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Itinerary', itinerarySchema);