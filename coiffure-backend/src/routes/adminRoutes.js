const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadCoupePhotos } = require('../middleware/uploadMiddleware');

const {
  listCoupes,
  getCoupe,
  createCoupe,
  updateCoupe,
  deleteCoupe,
} = require('../controllers/coupeController');

const {
  listRendezVous,
  getRendezVous,
  validerRendezVous,
  refuserRendezVous,
  terminerRendezVous,
  annulerRendezVous,
} = require('../controllers/rendezVousController');

const {
  getSalon,
  updateSalon,
  updateHoraires,
  listIndisponibilites,
  creerIndisponibilite,
  supprimerIndisponibilite,
} = require('../controllers/salonController');

const { dashboard, coupesPopulaires } = require('../controllers/dashboardController');
const { listClients, getClient } = require('../controllers/clientController');
const { exportPdf, exportExcel } = require('../controllers/rapportController');

const router = express.Router();

// Toutes les routes ci-dessous exigent un token admin valide
router.use(authMiddleware);

// --- Coupes (CRUD complet, avec upload jusqu'à 3 photos) ---
router.get('/coupes', listCoupes);
router.get('/coupes/:id', getCoupe);
router.post('/coupes', uploadCoupePhotos.array('photos', 3), createCoupe);
router.put('/coupes/:id', uploadCoupePhotos.array('photos', 3), updateCoupe);
router.delete('/coupes/:id', deleteCoupe);

// --- Rendez-vous (calendrier + workflow de validation) ---
router.get('/rendez-vous', listRendezVous);
router.get('/rendez-vous/:id', getRendezVous);
router.patch('/rendez-vous/:id/valider', validerRendezVous);
router.patch('/rendez-vous/:id/refuser', refuserRendezVous);
router.patch('/rendez-vous/:id/terminer', terminerRendezVous);
router.patch('/rendez-vous/:id/annuler', annulerRendezVous);

// --- Salon : paramètres, horaires, congés ---
router.get('/salon', getSalon);
router.put('/salon', updateSalon);
router.put('/salon/horaires', updateHoraires);
router.get('/indisponibilites', listIndisponibilites);
router.post('/indisponibilites', creerIndisponibilite);
router.delete('/indisponibilites/:id', supprimerIndisponibilite);

// --- Tableau de bord CA ---
router.get('/dashboard', dashboard);
router.get('/dashboard/coupes-populaires', coupesPopulaires);

// --- Clients ---
router.get('/clients', listClients);
router.get('/clients/:id', getClient);

// --- Rapports exportables ---
router.get('/rapports/pdf', exportPdf);
router.get('/rapports/excel', exportExcel);

module.exports = router;
