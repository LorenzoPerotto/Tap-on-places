const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    nickname: {
      type: String,
      required: true,
      unique: true
    },
    nome: {
      type: String,
      required: true
    },
    cognome: {
      type: String,
      required: true
    },
    dataNascita: {
      type: Date,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    tipo: {
      type: String,
      enum: ['normale', 'comunale'],
      default: 'normale'
    },
    savedItineraries: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' }
    ],
    savedActivities: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }
    ]
  },
  {
    timestamps: true // crea automaticamente createdAt e updatedAt
  }
);

// Hash della password prima del salvataggio
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Metodo per confrontare la password
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);