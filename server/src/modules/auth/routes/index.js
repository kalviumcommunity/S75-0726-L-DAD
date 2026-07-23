const express = require('express');
const { register, login, getMe, logout, updateProfile, changePassword, updatePreferences } = require('../controllers/auth.controller');
const { authenticateToken } = require('../../../http/middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.patch('/me', authenticateToken, updateProfile);
router.patch('/me/password', authenticateToken, changePassword);
router.patch('/me/preferences', authenticateToken, updatePreferences);
router.post('/logout', authenticateToken, logout);

module.exports = router;
