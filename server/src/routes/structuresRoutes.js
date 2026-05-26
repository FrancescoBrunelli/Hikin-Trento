const express = require("express");
const router = express.Router();
const structuresController = require("../controllers/structuresController");
const authStructureMiddleware = require("../middleware/authStructureMiddleware");

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


/**
 * @swagger
 * /api/structures/basicInfo:
 *   put:
 *     summary: Update the authenticated managed structure's basic info
 *     description: >
 *       Updates name_owner, surname_owner and telephone of the authenticated managed structure.
 *       Requires a valid JWT token in the Authorization header issued to a managed structure.
 *     tags: [Structures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name_owner
 *               - surname_owner
 *               - telephone
 *             properties:
 *               name_owner:
 *                 type: string
 *                 example: "Marco"
 *               surname_owner:
 *                 type: string
 *                 example: "Bianchi"
 *               telephone:
 *                 type: string
 *                 example: "+39 0461 123456"
 *     responses:
 *       200:
 *         description: Structure info updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 managedstructure:
 *                   type: object
 *                   properties:
 *                     name_owner:
 *                       type: string
 *                       example: "Marco"
 *                     surname_owner:
 *                       type: string
 *                       example: "Bianchi"
 *                     telephone:
 *                       type: string
 *                       example: "+39 0461 123456"
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
 *       400:
 *         description: Error updating structure info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 */
router.put("/basicInfo", authStructureMiddleware, structuresController.structure_update_info);



/**
 * @swagger
 * /api/structures/password:
 *   put:
 *     summary: Update the authenticated managed structure's password
 *     description: >
 *       Updates the password of the authenticated managed structure.
 *       Requires the current password for verification before allowing the update.
 *       The new password is hashed automatically by the pre-save hook.
 *     tags: [Structures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - curr_password
 *               - new_password
 *               - confirm_password
 *             properties:
 *               curr_password:
 *                 type: string
 *                 description: The current password for verification
 *                 example: "rifugio123"
 *               new_password:
 *                 type: string
 *                 description: The new password (min 8 chars, at least one special character)
 *                 example: "rifugio456!"
 *               confirm_password:
 *                 type: string
 *                 description: Must match new_password
 *                 example: "rifugio456!"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *       401:
 *         description: Current password is wrong or passwords do not match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Current password is not correct. Try again"
 *       400:
 *         description: Error updating password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 */
router.put("/password", authStructureMiddleware, structuresController.structure_update_password);

module.exports = router;
