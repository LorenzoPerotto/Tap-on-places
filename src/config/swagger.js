import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caricamento del file OpenAPI 3
const swaggerDocument = YAML.load(
  path.join(__dirname, '../../doc/oas3.yaml')
);


const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true, // mantiene il token JWT tra le chiamate
  },
  customSiteTitle: 'Tap-on-places API Documentation',
};

export const swaggerSetup = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, swaggerOptions)
  );
};


