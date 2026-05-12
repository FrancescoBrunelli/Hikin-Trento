const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

/**
 * @swagger
 * /api/user/basicInfo:
 *   get:
 *     summary: Get authenticated user basic information
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User authenticated
 *                 id:
 *                   type: string
 *                   example: 663f3a8c91f4c2a7d1a12345
 *                 username:
 *                   type: string
 *                   example: mario_rossi
 *                 expiry:
 *                   type: string
 *                   example: 2026-05-12T18:30:00.000Z
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid token
 *       410:
 *         description: User does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user doesn't exist
 */
router.get("/basicInfo", usersController.user_basic_info);

module.exports = router;
