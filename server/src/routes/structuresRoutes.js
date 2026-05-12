const express = require("express");
const router = express.Router();
const structuresController = require("../controllers/structuresController");

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
module.exports = router;
