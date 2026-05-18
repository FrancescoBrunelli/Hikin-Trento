const express = require('express');
const router = express.Router();
const { structureLogin } = require('../controllers/structureLoginController');

router.post('/login_structure', structureLogin);

module.exports = router;