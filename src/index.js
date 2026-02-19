import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { swaggerSetup } from './config/swagger.js';
import utentiRouter from './api/utenti.js';
import itinerariRouter from './api/itinerario.js';
import attivitaRouter from './api/attività.js';
import informazioniRouter from './api/informazioni.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Carica .env solo in locale ---
if (process.env.NODE_ENV !== 'production') {
  import('dotenv').then(dotenv => {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
    console.log('Variabili .env caricate in locale');
  });
}

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// --- Connessione a MongoDB ---
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('Errore: MONGODB_URI non definito');
  process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connesso a MongoDB'))
  .catch(err => {
    console.error('Errore connessione MongoDB:', err);
    process.exit(1);
  });

// --- Swagger ---
swaggerSetup(app);

// --- Routing API ---
app.use('/api/v1/utenti', utentiRouter);
app.use('/api/v1/itinerari', itinerariRouter);
app.use('/api/v1/attivita', attivitaRouter);
app.use('/api/v1/informazioni', informazioniRouter);

// --- Error 404 ---
app.use((req, res) => res.status(404).json({ error: 'Endpoint non trovato' }));

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
  console.log(`Swagger disponibile su http://localhost:${PORT}/api-docs`);
});
