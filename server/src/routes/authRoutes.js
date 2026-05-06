const express = require ("express");
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/register_structure', authController.register_structure);


module.exports = router;
