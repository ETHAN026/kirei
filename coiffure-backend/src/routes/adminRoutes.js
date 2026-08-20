const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadSinglePhoto } = require('../middleware/uploadMiddleware');

const {
  listCoupes,
  getCoupe,
  createCoupe,
  updateCoupe,
  deleteCoupe,
} = require('../controllers/coupeController');

const { addPhoto, deletePhoto } = require('../controllers/coupePhotoController');

const {
  listRendezVous,
  getRendezVous,
  validerRendezVous,
  refuserRendezVous,
  terminerRendezVous,
  annulerRendezVous,
  assignerAssistant,
} = require('../controllers/rendezVousController');

const {
  adminListAssistants,
  adminCreateAssistant,
  adminUpdateAssistant,
  adminDeleteAssistant,
} = require('../controllers/assistantController');

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
const emailService = require('../services/emailService');

const router = express.Router();

// Toutes les routes ci-dessous exigent un token admin valide
router.use(authMiddleware);

// --- Coupes (CRUD infos ; les photos sont gérées séparément ci-dessous) ---
router.get('/coupes', listCoupes);
router.get('/coupes/:id', getCoupe);
router.post('/coupes', createCoupe);
router.put('/coupes/:id', updateCoupe);
router.delete('/coupes/:id', deleteCoupe);

// --- Photos d'une coupe (ajout/suppression indépendants, max 3) ---
router.post('/coupes/:id/photos', uploadSinglePhoto.single('photo'), addPhoto);
router.delete('/coupes/:id/photos/:photoId', deletePhoto);

// --- Rendez-vous (calendrier + workflow de validation) ---
router.get('/rendez-vous', listRendezVous);
router.get('/rendez-vous/:id', getRendezVous);
router.patch('/rendez-vous/:id/valider', validerRendezVous);
router.patch('/rendez-vous/:id/refuser', refuserRendezVous);
router.patch('/rendez-vous/:id/terminer', terminerRendezVous);
router.patch('/rendez-vous/:id/annuler', annulerRendezVous);
router.patch('/rendez-vous/:id/assistant', assignerAssistant);

// --- Assistants (CRUD géré par le coiffeur) ---
router.get('/assistants', adminListAssistants);
router.post('/assistants', adminCreateAssistant);
router.put('/assistants/:id', adminUpdateAssistant);
router.delete('/assistants/:id', adminDeleteAssistant);

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

// --- Test email (temporaire, à supprimer après debug) ---
router.post('/test-email', async (req, res) => {
  const transporter = require('../config/mailer');
  const to = req.body.email || process.env.SMTP_USER;
  try {
    await transporter.verify();
    console.log('[test-email] SMTP verify OK');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Test ULTRABARBER — email fonctionne ✅',
      html: '<h2>Mail de test ULTRABARBER</h2><p>Si tu reçois ce mail, SMTP fonctionne depuis Render !</p>',
    });
    console.log('[test-email] Mail envoyé:', info.messageId);
    res.json({ ok: true, messageId: info.messageId, to });
  } catch (err) {
    console.error('[test-email] ERREUR:', err.message, err.code);
    res.status(500).json({ ok: false, error: err.message, code: err.code });
  }
});

module.exports = router;
