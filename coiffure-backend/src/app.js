require('dotenv').config();
require('express-async-errors');

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const assistantAuthRoutes = require('./routes/assistantAuthRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Sécurité de base ---
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Anti brute-force sur l'authentification admin
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { error: 'Trop de tentatives, réessayez plus tard.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/assistant-auth/login', authLimiter);

// Anti-spam sur la création de rendez-vous publique
const rdvLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { error: 'Trop de demandes, réessayez plus tard.' },
});
app.use('/api/rendez-vous', rdvLimiter);

// Photos des coupes servies statiquement
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- Routes ---
app.get('/api/health', (req, res) => res.json({ status: 'ok', date: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/assistant-auth', assistantAuthRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route introuvable.' }));
app.use(errorHandler);

module.exports = app;
