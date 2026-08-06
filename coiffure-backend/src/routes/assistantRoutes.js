const express = require('express');
const assistantAuthMiddleware = require('../middleware/assistantAuthMiddleware');
const { mesRendezVous } = require('../controllers/assistantController');

const router = express.Router();

router.use(assistantAuthMiddleware);

router.get('/rendez-vous', mesRendezVous);

module.exports = router;
