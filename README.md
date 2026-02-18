# Tap-on-Places

Applicazione web per la gestione e consultazione di itinerari e attività turistiche.

Il progetto è composto da:
- **Backend**: Node.js + Express + MongoDB.
- **Frontend**: Applicazione separata nella cartella `frontend`.
- **Autenticazione**: JWT (JSON Web Token).
- **Documentazione API**: Swagger (OpenAPI 3).

# Struttura del progetto

Tap-on-Places:
Tap-on-Places/
├── README.md
├── package.json
├── .env.example
├── .gitignore
│
├── src/
│ ├── api/
│ ├── config/
│ ├── models/
│ ├── middleware/
│ ├── utils/
│ └── index.js
│
├── frontend/
│
│ doc/
└──└──oas3.yaml

# Requisiti

- Node.js 
- npm
- MongoDB locale oppure MongoDB Atlas

# Variabili d’ambiente

Il progetto utilizza variabili d’ambiente per:
-Proteggere credenziali sensibili
-Separare configurazioni di sviluppo e produzione
Il file .env non è presente su GitHub per motivi di sicurezza.

È disponibile il file .env.example, che può essere copiato con: cp .env.example .env (linux)
                                                                copy .env.example .env (windows)
Successivamente, compilare il file .env con le proprie credenziali.

# Avvio del progetto in locale

1) Installare dipendenze Backend

Dalla root del progetto: 

npm install

----

2) Avviare il Backend

npm start

----

Se tutto è corretto, verrà mostrato:

Connesso a MongoDB
Server avviato su http://localhost:8080
Swagger disponibile su http://localhost:8080/api-docs

3) Installare dipendenze Frontend

Aprire un nuovo terminale:

cd frontend

npm install

----

4) Avviare il Frontend

npm run dev

----

Aprire l'URL mostrato nel terminale.

# Documentazione API

La documentazione delle API è disponibile tramite Swagger:
Le API sono documentate secondo le specifiche OpenAPI 3.

# Autenticazione (JWT)

Il sistema utilizza JWT per proteggere gli endpoint.

Procedura:

1. L’utente effettua login 
2. Se le credenziali sono corrette, viene generato un token JWT
3. Il token deve essere inviato nelle richieste protette tramite header: x-access-token: <token>

Il middleware verifica:
- Presenza del token
- Validità
- Scadenza

Se il token è valido, la richiesta prosegue.

# Protezione degli endpoint

Gli endpoint protetti utilizzano un middleware di verifica token.
Gli endpoint pubblici sono accessibili senza autenticazione.

# Database

Il progetto utilizza MongoDB con Mongoose.

Possibili configurazioni:
- MongoDB locale
- MongoDB Atlas (consigliato per produzione)

# Deployment

//Per il deployment è necessario:

//1. Caricare frontend e backend su un servizio cloud (es. Render)
//2. Configurare le variabili d’ambiente nel pannello del servizio
//3. Usato MongoDB Atlas per il database remoto

//Le variabili non devono mai essere hardcoded nel codice.

# Tecnologie utilizzate

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Swagger (OpenAPI 3)
- Vue.js (frontend)
