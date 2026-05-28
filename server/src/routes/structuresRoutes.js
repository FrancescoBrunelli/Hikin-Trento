const express = require("express");
const router = express.Router();
const structuresController = require("../controllers/structuresController");
const authStructureMiddleware = require("../middleware/authStructureMiddleware");
const deleteController = require("../controllers/deleteController");


/**
 * @swagger
 * /api/structures/basicInfo:
 *   get:
 *     summary: Get nearby structures basic information
 *     tags:
 *       - Structures
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           example: 46.0703
 *         description: User latitude
 *
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           example: 11.1217
 *         description: User longitude
 *
 *       - in: query
 *         name: radius
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           example: 10
 *         description: Search radius in meters
 *
 *       - in: query
 *         name: show_managed
 *         required: true
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Include managed structures
 *
 *       - in: query
 *         name: show_unmanaged
 *         required: true
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Include unmanaged structures
 *
 *     responses:
 *       200:
 *         description: Structures retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 structures:
 *                   type: array
 *                   items:
 *                     type: object
 *                   example:
 *                     - id: 1
 *                       name: Rifugio Alpino
 *                       latitude: 46.0703
 *                       longitude: 11.1217
 *                       managed: true
 *
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid coordinates
 */
router.get("/basicInfo", structuresController.basic_info);



/**
 * @swagger
 * /api/structures/search:
 *   get:
 *     summary: Search structures by name and optional managed filter
 *     description: >
 *       Returns a list of structures matching the search query.
 *       Optionally filter by managed status.
 *       If no query is provided, returns all structures.
 *     tags: [Structures]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: false
 *         description: Search query string to filter structures by name
 *         example: "Rifugio"
 *       - in: query
 *         name: managed
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         required: false
 *         description: Filter by managed status
 *         example: "true"
 *     responses:
 *       200:
 *         description: List of matching structures
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 structures:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                       name:
 *                         type: string
 *                         example: "Rifugio Dolomiti"
 *                       managed:
 *                         type: boolean
 *                         example: true
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
 *       400:
 *         description: Error searching structures
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 */
router.get("/search", structuresController.search);


router.delete("/account", authStructureMiddleware, deleteController.delete_managed_structure);


module.exports = router;
