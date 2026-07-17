const express = require('express');
const { register, login, getMe, logout } = require('../controllers/auth.controller');
const { authenticateToken } = require('../../../http/middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

module.exports = router;
