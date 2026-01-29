import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, unique: true },
    tipologia: { type: String },
    tempo: { type: Number },
    budget: { type: Number },
    descrizione: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    numPersone: { type: Number, default: 0 },
    etaMedia: { type: Number },
    orarioAffluenza: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('Itinerary', itinerarySchema);
