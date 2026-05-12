const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

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
router.get("/basicInfo", usersController.user_basic_info);

module.exports = router;
