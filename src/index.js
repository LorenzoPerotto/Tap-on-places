import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

import { swaggerSetup } from './config/swagger.js';

// Router API
import utentiRouter from './api/utenti.js';
import itinerariRouter from './api/itinerario.js';
import attivitaRouter from './api/attività.js';
import informazioniRouter from './api/informazioni.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;


//Middleware globali
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());


//Connessione a MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connesso a MongoDB');
  })
  .catch((error) => {
    console.error('Errore connessione MongoDB:', error);
    process.exit(1);
  });


//Swagger OpenAPI
swaggerSetup(app);


//Routing API v1
app.use('/api/v1/utenti', utentiRouter);
app.use('/api/v1/itinerari', itinerariRouter);
app.use('/api/v1/attivita', attivitaRouter);
app.use('/api/v1/informazioni', informazioniRouter);


//Gestione errori 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint non trovato'
  });
});


//Avvio server
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
  console.log(`Swagger disponibile su http://localhost:${PORT}/api-docs`);
});

