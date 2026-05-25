const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 *  @swagger
 *  /api/user/basicInfo:
 *    get:
 *      summary: Get authenticated user basic information
 *      tags:
 *        - Users
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        200:
 *          description: User authenticated successfully
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  user_id:
 *                    type: string
 *                    example: 6a035daf4afc1df95fbbe97f
 *                  username:
 *                    type: string
 *                    example: giulia_rossi
 *                  name:
 *                    type: string
 *                    example: Giulia
 *                  surname:
 *                    type: string
 *                    example: Rossi
 *                  date_of_birth:
 *                    type: string
 *                    example: 1999-07-25-T00:00:00.000Z
 *        400:
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: Invalid token
 *        410:
 *          description: User does not exist
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: user doesn't exist
 */
router.get("/basicInfo", authMiddleware, usersController.user_basic_info);


/**
 * @swagger
 * /api/users/basicInfo:
 *   put:
 *     summary: Update the authenticated user's basic info
 *     description: >
 *       Updates name, surname and username of the currently authenticated user.
 *       Requires a valid JWT token in the Authorization header.
 *       The token is verified by the auth middleware before reaching this endpoint.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - surname
 *               - username
 *             properties:
 *               name:
 *                 type: string
 *                 example: Giulia
 *               surname:
 *                 type: string
 *                 example: Rossi
 *               username:
 *                 type: string
 *                 example: giulzzzzz
 *     responses:
 *       200:
 *         description: User info updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *       400:
 *         description: Failed to update user info (e.g. duplicate username)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "username già in uso"
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Not authorized"
 */
router.put("/basicInfo", authMiddleware, usersController.user_update_info);


/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: Update user password
 *     description: Allows an authenticated user to change their password.
 *     tags:
 *       - Users
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
 *                 example: oldPassword123
 *               new_password:
 *                 type: string
 *                 example: newPassword123
 *               confirm_password:
 *                 type: string
 *                 example: newPassword123
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
 *                   example: success
 *       401:
 *         description: Invalid current password or password confirmation mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Current password is not correct. Try again
 *       400:
 *         description: Generic error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.put("/password", authMiddleware, usersController.user_update_password);

module.exports = router;
