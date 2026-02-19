import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  nickname: { type: String, required: true, unique: true },
  nome: { type: String, required: true },
  cognome: { type: String, required: true },
  dataNascita: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tipo: { type: String, enum: ['normale', 'comunale'], default: 'normale' },
  codiceConferma: { type: Number, default: null },
  confermato: { type: Boolean, default: false },
  savedItineraries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' }],
  savedActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }]
}, { timestamps: true });

// Il hashing della password viene gestito direttamente nella route di registrazione
// tramite passwordUtils.js per evitare doppio hashing

// Metodo per confrontare la password
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
