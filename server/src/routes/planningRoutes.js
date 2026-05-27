const express = require('express');
const router = express.Router();
const { 
    calculateRoute,
    savePlan,
    getUserPlans,
    getPlan,
    deletePlan,
    // sharePlan,      // TODO: implement sharing later
    // getSharedPlan   // TODO: implement sharing later
} = require('../controllers/planningController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes
router.post('/route', authMiddleware, calculateRoute);
router.post('/save', authMiddleware, savePlan);
router.get('/', authMiddleware, getUserPlans);
router.get('/:id', authMiddleware, getPlan);
router.delete('/:id', authMiddleware, deletePlan);

// TODO: sharing routes - implement later
// router.post('/:id/share', authMiddleware, sharePlan);
// router.get('/shared/:token', getSharedPlan);

module.exports = router;