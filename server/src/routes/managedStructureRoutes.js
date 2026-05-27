const express = require("express");
const router = express.Router();
const managedStructureController = require("../controllers/managedStructureController");
const authStructureMiddleware = require("../middleware/authStructureMiddleware");


/**
 * @swagger
 * /api/structures/basicInfo:
 *   get:
 *     summary: Get basic info of the authenticated managed structure
 *     description: >
 *       Returns the basic info of the managed structure identified by the JWT token.
 *       Requires a valid JWT token in the Authorization header issued to a managed structure.
 *     tags: [Structures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Managed structure info retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 managed_structure_id:
 *                   type: string
 *                   example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                 name_owner:
 *                   type: string
 *                   example: "Marco"
 *                 surname_owner:
 *                   type: string
 *                   example: "Bianchi"
 *                 telephone:
 *                   type: string
 *                   example: "+39 0461 123456"
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
 *         description: Error retrieving structure info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 */
router.get("/basicInfo", authStructureMiddleware, managedStructureController.managed_structure_basic_info);



/**
 * @swagger
 * /api/managedStructure/basicInfo:
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
router.put("/basicInfo", authStructureMiddleware, managedStructureController.structure_update_info);



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
router.put("/password", authStructureMiddleware, managedStructureController.structure_update_password);


module.exports = router;
