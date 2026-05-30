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

/**
 * @swagger
 * /api/favourites/structures:
 *   delete:
 *     summary: Remove a structure from the authenticated user's favourites
 *     description: >
 *       Removes a structure from the user's favourites list.
 *       If the structure is not in the list, no changes are made
 *       and the status will be "Item not in the list".
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
 *                 description: The MongoDB ObjectId of the structure to remove from favourites
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
 *                   enum: [Removed item from the list, Item not in the list]
 *                   description: >
 *                     "Removed item from the list" if the structure was removed,
 *                     "Item not in the list" if it was not in the favourites
 *                   example: "Removed item from the list"
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
 *         description: Error removing structure from favourites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
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
router.delete(
  "/structures",
  authMiddleware,
  favouritesController.delete_fav_structure,
);

/**
 * @swagger
 * /api/favourites/structures:
 *   get:
 *     summary: Get the authenticated user's favourite structures
 *     description: >
 *       Returns the full list of favourite structures saved by the authenticated user.
 *       Requires a valid JWT token in the Authorization header.
 *     tags: [Favourites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favourite structures retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fav_structures:
 *                   type: array
 *                   description: The list of favourite structures
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
 *                       managed:
 *                         type: boolean
 *                         example: true
 *       400:
 *         description: Error retrieving favourite structures
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
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
router.get(
  "/structures",
  authMiddleware,
  favouritesController.get_fav_structures,
);

/**
 * @swagger
 * /api/favourites/trails:
 *   put:
 *     summary: Add a trail to the authenticated user's favourites
 *     description: >
 *       Adds a trail to the user's favourites list.
 *       If the trail is already in the list, it is not added again
 *       and the status will be "item was already in the list".
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
 *                 description: The MongoDB ObjectId of the trail to add to favourites
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
 *                   enum: [added item in the list, item was already in the list]
 *                   example: "added item in the list"
 *                 fav_trails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                       name:
 *                         type: string
 *                         example: "Sentiero dei Forti"
 *                       difficulty:
 *                         type: string
 *                         example: "Medium"
 *                       distance_km:
 *                         type: number
 *                         example: 12
 *       400:
 *         description: Trail not found or error saving favourites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Trail not found"
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
router.put("/trails", authMiddleware, favouritesController.fav_trails);

/**
 * @swagger
 * /api/favourites/trails:
 *   delete:
 *     summary: Remove a trail from the authenticated user's favourites
 *     description: >
 *       Removes a trail from the user's favourites list.
 *       If the trail is not in the list, no changes are made
 *       and the status will be "Item not in the list".
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
 *                 description: The MongoDB ObjectId of the trail to remove from favourites
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
 *                   enum: [Removed item from the list, Item not in the list]
 *                   example: "Removed item from the list"
 *                 fav_trails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                       name:
 *                         type: string
 *                         example: "Sentiero dei Forti"
 *       400:
 *         description: Error removing trail from favourites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
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
router.delete("/trails", authMiddleware, favouritesController.delete_fav_trail);

/**
 * @swagger
 * /api/favourites/trails:
 *   get:
 *     summary: Get the authenticated user's favourite trails
 *     description: >
 *       Returns the full list of favourite trails saved by the authenticated user.
 *       Requires a valid JWT token in the Authorization header.
 *     tags: [Favourites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favourite trails retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fav_trails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                       name:
 *                         type: string
 *                         example: "Sentiero dei Forti"
 *                       difficulty:
 *                         type: string
 *                         example: "Medium"
 *                       distance_km:
 *                         type: number
 *                         example: 12
 *       400:
 *         description: Error retrieving favourite trails
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
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
router.get("/trails", authMiddleware, favouritesController.get_fav_trails);

module.exports = router;
