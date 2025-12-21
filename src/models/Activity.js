const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      unique: true
    },
    tipo: {
      type: String,
      required: true // museo, parco, piazza...
    },
    coordinate: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
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

    // Dati visibili solo agli utenti comunali
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

module.exports = mongoose.model('Activity', activitySchema);