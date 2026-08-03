const express = require('express');
const { listCoupes, getCoupe } = require('../controllers/coupeController');
const { getSalon } = require('../controllers/salonController');
const {
  creneauxDisponibles,
  creerRendezVous,
} = require('../controllers/rendezVousController');

const router = express.Router();

// Salon (vitrine)
router.get('/salon', getSalon);

// Catalogue des coupes
router.get('/coupes', listCoupes);
router.get('/coupes/:id', getCoupe);

// Créneaux + prise de rendez-vous
router.get('/creneaux-disponibles', creneauxDisponibles);
router.post('/rendez-vous', creerRendezVous);

module.exports = router;
