import mongoose from 'mongoose';


//Connessione al database MongoDB

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('MONGO_URI non definita nelle variabili d’ambiente');
    }

    await mongoose.connect(mongoURI);

    console.log('Connessione a MongoDB avvenuta con successo');
  } catch (error) {
    console.error('Errore di connessione a MongoDB:', error.message);
    process.exit(1); // termina l'app se il DB non è raggiungibile
  }
};

export default connectDB;
