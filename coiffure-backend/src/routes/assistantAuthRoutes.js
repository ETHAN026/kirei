const express = require('express');
const assistantAuthMiddleware = require('../middleware/assistantAuthMiddleware');
const { login, me, changePassword } = require('../controllers/assistantAuthController');

const router = express.Router();

router.post('/login', login);
router.get('/me', assistantAuthMiddleware, me);
router.post('/change-password', assistantAuthMiddleware, changePassword);

module.exports = router;
