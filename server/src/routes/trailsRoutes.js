const express = require('express');
const router = express.Router();
const trailsController = require('../controllers/trailsController');

/**
 * @swagger
 * /api/trails:
 *   get:
 *     summary: Get trails with optional filters
 *     description: >
 *       Returns a list of trails filtered by various parameters including location,
 *       difficulty, distance, duration, and more.
 *       If lat, lng, and radius are provided, only trails within that radius are returned.
 *     tags: [Trails]
 *     parameters:
 *       - in: query
 *         name: osm_id
 *         schema:
 *           type: number
 *         description: The OpenStreetMap ID of the trail
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Partial/full trail name (case-insensitive)
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *         description: The difficulty level of the trail
 *       - in: query
 *         name: distance_km
 *         schema:
 *           type: number
 *         description: Minimum trail distance in kilometers
 *       - in: query
 *         name: ascent_m
 *         schema:
 *           type: number
 *         description: Minimum elevation gain in meters
 *       - in: query
 *         name: descent_m
 *         schema:
 *           type: number
 *         description: Minimum elevation loss in meters
 *       - in: query
 *         name: duration_h
 *         schema:
 *           type: number
 *         description: Minimum duration in hours (applies to both directions)
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         description: Partial/full starting location name (case-insensitive)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         description: Partial/full ending location name (case-insensitive)
 *       - in: query
 *         name: operator
 *         schema:
 *           type: string
 *         description: Partial/full operator name (case-insensitive)
 *       - in: query
 *         name: roundtrip
 *         schema:
 *           type: boolean
 *         description: Whether the trail is a roundtrip
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
 *         description: List of trails matching the filters
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
 *                   example: Trails retrieved successfully
 *                 trails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       osm_id:
 *                         type: number
 *                         example: 123456
 *                       name:
 *                         type: string
 *                         example: Sentiero della Pace
 *                       difficulty:
 *                         type: string
 *                         example: medium
 *                       distance_km:
 *                         type: number
 *                         example: 12.5
 *                       ascent_m:
 *                         type: number
 *                         example: 850
 *                       descent_m:
 *                         type: number
 *                         example: 850
 *                       duration_forward:
 *                         type: string
 *                         example: "04:30"
 *                       duration_backward:
 *                         type: string
 *                         example: "03:45"
 *                       from:
 *                         type: string
 *                         example: Trento
 *                       to:
 *                         type: string
 *                         example: Rovereto
 *                       roundtrip:
 *                         type: boolean
 *                         example: false
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

router.get('/', trailsController.getTrails);

module.exports = router;