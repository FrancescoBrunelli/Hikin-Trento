const express = require('express');
const router = express.Router();
const { calculateRoute } = require('../controllers/planningController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/route', authMiddleware, calculateRoute);

module.exports = router;