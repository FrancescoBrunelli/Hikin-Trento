const express = require('express');
const router = express.Router();
const PIsController = require('../controllers/PIsController');

/**
 * @swagger
 * /api/pis:
 *   get:
 *     summary: Get points of interest with optional filters
 *     description: >
 *       Returns a list of points of interest filtered by various parameters including
 *       location, name, and shelter type.
 *       If lat and lng are provided, only points within the given radius are returned.
 *     tags: [PIs]
 *     parameters:
 *       - in: query
 *         name: osm_id
 *         schema:
 *           type: number
 *         description: The OpenStreetMap ID of the point of interest
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Partial/full name (case-insensitive)
 *       - in: query
 *         name: shelter_type
 *         schema:
 *           type: string
 *           enum: [picnic_shelter, rock_shelter, weather_shelter, alpine_hut, basic_hut, lean_to]
 *         description: Shelter type filter (exact match)
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude of the center point for radius search
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude of the center point for radius search
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Search radius in kilometers (defaults to 10 if lat/lng provided)
 *     responses:
 *       200:
 *         description: List of points of interest matching the filters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 5
 *                 message:
 *                   type: string
 *                   example: PIs retrieved successfully
 *                 PIs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       osm_id:
 *                         type: number
 *                         example: 1368777511
 *                       name:
 *                         type: string
 *                         example: Sant' Antonio
 *                       shelter_type:
 *                         type: string
 *                         example: picnic_shelter
 *                         nullable: true
 *                       coordinates:
 *                         type: object
 *                         properties:
 *                           latitude:
 *                             type: number
 *                             example: 45.9113489
 *                           longitude:
 *                             type: number
 *                             example: 11.0835163
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Server Error: ..."
 */

router.get('/', PIsController.getPIs);

module.exports = router;
