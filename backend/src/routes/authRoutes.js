const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
const verifyToken = require('../middleware/authMiddleware');
router.post('/set-mpin', verifyToken, authController.setMpin);

module.exports = router;
