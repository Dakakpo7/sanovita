// Configuration principale de l'application Express
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ===== MIDDLEWARES =====
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ROUTE DE TEST =====
app.get('/', (req, res) => {
  res.json({
    message: '🏥 Bienvenue sur l\'API SanoVita !',
    version: '1.0.0',
    status: 'En ligne ✅'
  });
});

// ===== ROUTES DES MODULES =====
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/rdv', require('./modules/rendez-vous/rdv.routes'));
app.use('/api/consultations', require('./modules/consultations/consultation.routes'));
app.use('/api/chatbot', require('./modules/chatbot/chatbot.routes'));
app.use('/api/medicaments', require('./modules/medicaments/medicament.routes'));

// ===== GESTION DES ERREURS =====
app.use((req, res) => {
  res.status(404).json({
    message: '❌ Cette page n\'existe pas'
  });
});

module.exports = app;