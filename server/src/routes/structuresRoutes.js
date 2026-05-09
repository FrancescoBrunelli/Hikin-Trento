const express = require("express");
const router = express.Router();
const structuresController = require("../controllers/structuresController");

/**
 * @swagger
 * /api/structures/basicInfo:
 *   get:
 *     summary: Get basic info of all structures with optional filters
 *     description: >
 *       Returns a list of structures filtered by geographic radius and management status.
 *       If radius is 0, no location filter is applied.
 *       At least one of show_managed or show_unmanaged must be true to get results.
 *     tags: [Structures]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coordinates
 *               - radius
 *               - show_managed
 *               - show_unmanaged
 *             properties:
 *               coordinates:
 *                 type: object
 *                 required:
 *                   - latitude
 *                   - longitude
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     example: 46.0748
 *                   longitude:
 *                     type: number
 *                     example: 11.1217
 *               radius:
 *                 type: number
 *                 description: Search radius in meters. Use 0 for no radius filter.
 *                 example: 5000
 *               show_managed:
 *                 type: boolean
 *                 description: Whether to include managed structures
 *                 example: true
 *               show_unmanaged:
 *                 type: boolean
 *                 description: Whether to include unmanaged structures
 *                 example: true
 *     responses:
 *       201:
 *         description: List of structures matching the filters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: get all structures
 *                 structures:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Rifugio Dolomiti
 *                       coordinates:
 *                         type: object
 *                         properties:
 *                           latitude:
 *                             type: number
 *                             example: 46.4102
 *                           longitude:
 *                             type: number
 *                             example: 11.3428
 *                           altitude:
 *                             type: number
 *                             example: 2150
 *                       managed:
 *                         type: boolean
 *                         example: false
 *       400:
 *         description: Error retrieving structures
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 */
router.get("/basicInfo", structuresController.basic_info);

module.exports = router;
