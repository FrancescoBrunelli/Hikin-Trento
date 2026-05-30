const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const favouritesController = require("../controllers/favouritesController");

/**
 * @swagger
 * /api/favourites/structures:
 *   put:
 *     summary: Add a structure to the authenticated user's favourites
 *     description: >
 *       Adds a structure to the user's favourites list.
 *       If the structure is already in the list, it is not added again
 *       and the status will be "was_there".
 *       Requires a valid JWT token in the Authorization header.
 *     tags: [Favourites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - _id
 *             properties:
 *               _id:
 *                 type: string
 *                 description: The MongoDB ObjectId of the structure to add to favourites
 *                 example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *     responses:
 *       200:
 *         description: Request processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [added, was_there]
 *                   description: >
 *                     "added" if the structure was added to favourites,
 *                     "was_there" if it was already in the list
 *                   example: "added"
 *                 fav_structures:
 *                   type: array
 *                   description: The updated list of favourite structures
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                       name:
 *                         type: string
 *                         example: "Rifugio Dolomiti"
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
 *         description: Structure not found or error saving favourites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Structure not found"
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Access denied. No token provided."
 */
router.put("/structures", authMiddleware, favouritesController.fav_structure);

module.exports = router;
