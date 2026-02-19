import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import { swaggerSetup } from './config/swagger.js';

// Router API
import utentiRouter from './api/utenti.js';
import itinerariRouter from './api/itinerario.js';
import attivitaRouter from './api/attività.js';
import informazioniRouter from './api/informazioni.js';

// ----- Risoluzione path per .env nella root -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carica il .env dalla root del progetto
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Test variabile
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const app = express();
const PORT = process.env.PORT || 8080;

// ----- Middleware globali -----
const frontendURL = process.env.https://tap-on-places-frontend.onrender.com || 'http://localhost:5173';

app.use(cors({
  origin: https://tap-on-places-frontend.onrender.com,
  credentials: true
}));

app.use(express.json());

// ----- Connessione a MongoDB -----
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('Errore: MONGODB_URI non definito nel file .env');
  process.exit(1);
}

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connesso a MongoDB');
  })
  .catch((error) => {
    console.error('Errore connessione MongoDB:', error);
    process.exit(1);
  });

// ----- Swagger OpenAPI -----
swaggerSetup(app);

// ----- Routing API v1 -----
app.use('/api/v1/utenti', utentiRouter);
app.use('/api/v1/itinerari', itinerariRouter);
app.use('/api/v1/attivita', attivitaRouter);
app.use('/api/v1/informazioni', informazioniRouter);

// ----- Gestione errori 404 -----
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint non trovato'
  });
});

// ----- Avvio server -----
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
  console.log(`Swagger disponibile su http://localhost:${PORT}/api-docs`);
});


