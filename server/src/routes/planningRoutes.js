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

/**
 * @swagger
 * tags:
 *   name: Planning
 *   description: Trip planning and route calculation endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RouteResult:
 *       type: object
 *       properties:
 *         distance:
 *           type: number
 *           description: Distance in meters
 *           example: 4200
 *         duration:
 *           type: number
 *           description: Duration in seconds
 *           example: 7020
 *         ascent:
 *           type: number
 *           description: Elevation gain in meters
 *           example: 226
 *         descent:
 *           type: number
 *           description: Elevation loss in meters
 *           example: 296
 *         geometry:
 *           type: string
 *           description: Encoded polyline string (3D, includes elevation)
 *         segments:
 *           type: array
 *           description: Turn-by-turn instructions
 *     Plan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 6a283955bfd34c7e15d3dc63
 *         name:
 *           type: string
 *           example: Tuckett - Brentei
 *         description:
 *           type: string
 *           example: Classic Brenta Dolomites route
 *         distance:
 *           type: number
 *           example: 4200
 *         duration:
 *           type: number
 *           example: 7020
 *         multiDay:
 *           type: boolean
 *           example: false
 *         days:
 *           type: number
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/planning/route:
 *   post:
 *     summary: Calculate a hiking route between two points
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - start
 *               - end
 *             properties:
 *               start:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: "[longitude, latitude]"
 *                 example: [10.882, 46.192]
 *               end:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: "[longitude, latitude]"
 *                 example: [10.875, 46.175]
 *               waypoints:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: number
 *                 description: "Optional intermediate points [[lng, lat], ...]"
 *                 example: []
 *     responses:
 *       200:
 *         description: Route calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Route calculated successfully
 *                 route:
 *                   $ref: '#/components/schemas/RouteResult'
 *       400:
 *         description: Missing start or end coordinates
 *       500:
 *         description: ORS API error or route calculation failed
 */
router.post('/route', authMiddleware, calculateRoute);

/**
 * @swagger
 * /api/planning/favorites/me:
 *   get:
 *     summary: Get all plans favorited by the logged in user
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorites retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Favorites retrieved successfully
 *                 plans:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Plan'
 *       401:
 *         description: Unauthorized
 */
router.get('/favorites/me', authMiddleware, getFavorites);

/**
 * @swagger
 * /api/planning/{id}/favorite:
 *   post:
 *     summary: Save a plan to favorites
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     responses:
 *       200:
 *         description: Plan added to favorites
 *       400:
 *         description: Plan already in favorites
 *       404:
 *         description: Plan not found
 *   delete:
 *     summary: Remove a plan from favorites
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     responses:
 *       200:
 *         description: Plan removed from favorites
 *       400:
 *         description: Plan not in favorites
 *       404:
 *         description: Plan not found
 */
router.post('/:id/favorite', authMiddleware, saveFavorite);
router.delete('/:id/favorite', authMiddleware, removeFavorite);

/**
 * @swagger
 * /api/planning/save:
 *   post:
 *     summary: Save a new plan
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - start
 *               - end
 *               - route
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tuckett - Brentei
 *               description:
 *                 type: string
 *                 example: Classic Brenta Dolomites route
 *               start:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [10.882, 46.192]
 *               end:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [10.875, 46.175]
 *               waypoints:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: number
 *                 example: []
 *               route:
 *                 $ref: '#/components/schemas/RouteResult'
 *               multiDay:
 *                 type: boolean
 *                 example: false
 *               days:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Plan saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Plan saved successfully
 *                 plan:
 *                   $ref: '#/components/schemas/Plan'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
router.post('/save', authMiddleware, savePlan);

/**
 * @swagger
 * /api/planning/:
 *   get:
 *     summary: Get all plans created by the logged in user
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Plans retrieved successfully
 *                 plans:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Plan'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, getUserPlans);

/**
 * @swagger
 * /api/planning/{id}:
 *   get:
 *     summary: Get a specific plan by ID (must be owner)
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     responses:
 *       200:
 *         description: Plan retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plan:
 *                   $ref: '#/components/schemas/Plan'
 *       404:
 *         description: Plan not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update a plan (must be owner)
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated trip name
 *               description:
 *                 type: string
 *                 example: Updated description
 *               multiDay:
 *                 type: boolean
 *                 example: true
 *               days:
 *                 type: number
 *                 example: 2
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *       404:
 *         description: Plan not found
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete a plan (must be owner)
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan ID
 *     responses:
 *       200:
 *         description: Plan deleted successfully
 *       404:
 *         description: Plan not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authMiddleware, getPlan);
router.put('/:id', authMiddleware, updatePlan);
router.delete('/:id', authMiddleware, deletePlan);

module.exports = router;