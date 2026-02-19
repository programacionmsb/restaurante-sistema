const cors = require('cors');

const setupCORS = (app) => {
  app.use(cors({
    origin: [
      'https://restaurante-frontend-017o.onrender.com',
      'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
};

module.exports = { setupCORS };
