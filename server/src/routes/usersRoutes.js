const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const authMiddleware = require("../middleware/authMiddleware");
const deleteController = require("../controllers/deleteController");

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
 * /api/user/basicInfo:
 *   put:
 *     summary: Update authenticated user's information
 *     description: Allows an authenticated user to update their personal information.
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
 *               - name
 *               - surname
 *               - username
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mario
 *               surname:
 *                 type: string
 *                 example: Rossi
 *               username:
 *                 type: string
 *                 example: mario.rossi
 *     responses:
 *       200:
 *         description: User information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Mario
 *                     surname:
 *                       type: string
 *                       example: Rossi
 *                     username:
 *                       type: string
 *                       example: mario.rossi
 *                     date_of_birth:
 *                       type: string
 *                       format: date-time
 *                       example: 2000-05-15T00:00:00.000Z
 *       400:
 *         description: Validation or update error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Username already exists
 */
router.put("/basicInfo", authMiddleware, usersController.user_update_info);

/**
 * @swagger
 * /api/user/password:
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


router.delete("/account", authMiddleware, deleteController.delete_user);


module.exports = router;
