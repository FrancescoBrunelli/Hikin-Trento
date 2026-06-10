const express = require('express');
const router = express.Router();
const { 
    calculateRoute,
    savePlan,
    getUserPlans,
    getPlan,
    updatePlan,
    deletePlan,
    saveFavorite,
    removeFavorite,
    getFavorites
} = require('../controllers/planningController');
const authMiddleware = require('../middleware/authMiddleware');

// Route calculation
router.post('/route', authMiddleware, calculateRoute);
router.post('/save', authMiddleware, savePlan);
router.get('/', authMiddleware, getUserPlans);
router.get('/:id', authMiddleware, getPlan);
router.delete('/:id', authMiddleware, deletePlan);

// TODO: sharing routes - implement later
// router.post('/:id/share', authMiddleware, sharePlan);
// router.get('/shared/:token', getSharedPlan);

// Favorites — must be before /:id routes
router.get('/favorites/me', authMiddleware, getFavorites);
router.post('/:id/favorite', authMiddleware, saveFavorite);
router.delete('/:id/favorite', authMiddleware, removeFavorite);

// Own plans
router.post('/save', authMiddleware, savePlan);
router.get('/', authMiddleware, getUserPlans);
router.get('/:id', authMiddleware, getPlan);
router.put('/:id', authMiddleware, updatePlan);
router.delete('/:id', authMiddleware, deletePlan);

module.exports = router;