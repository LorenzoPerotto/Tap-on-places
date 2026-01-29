import mongoose from 'mongoose';

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
    tipologia: { type: String },
    tempo: { type: Number, default: 0 }, // minuti
    budget: { type: Number, default: 0 },
    descrizione: { type: String },

    // Dati visibili solo agli utenti comunali
    numPersone: { type: Number, default: 0 },
    etaMedia: { type: Number },
    orarioAffluenza: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('Activity', activitySchema);
