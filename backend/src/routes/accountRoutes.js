const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken); // Protect all routes

router.post('/', accountController.createAccount);
router.get('/', accountController.getAccounts);

module.exports = router;
