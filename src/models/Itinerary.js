import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, unique: true },
    tipologia: { type: String },
    tempo: { type: Number, default: 0 },
    budget: { type: Number, default: 0 },
    descrizione: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    numPersone: { type: Number, default: 0 },
    etaMedia: { type: Number, default: 0 },
    orarioAffluenza: { type: String }
  },
  { timestamps: true }
);

const Itinerary = mongoose.models.Itinerary || mongoose.model('Itinerary', itinerarySchema);
export default Itinerary;
