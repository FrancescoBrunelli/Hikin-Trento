const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
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
 *               - dateOfBirth
 *               - password
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
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: 2000-05-15
 *               password:
 *                 type: string
 *                 example: mypassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Username already taken
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/register_structure:
 *   post:
 *     summary: Register an existing structure as managed
 *     description: >
 *       Links an existing structure to an owner account.
 *       The structure must exist in the database and must not already be managed.
 *       The password will be hashed automatically before saving.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - name_owner
 *               - surname_owner
 *               - telephone
 *               - password
 *               - Structure_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rifugio Dolomiti
 *               name_owner:
 *                 type: string
 *                 example: Marco
 *               surname_owner:
 *                 type: string
 *                 example: Bianchi
 *               telephone:
 *                 type: string
 *                 example: "+39 0461 123456"
 *               password:
 *                 type: string
 *                 example: rifugio123
 *               Structure_id:
 *                 type: string
 *                 description: The MongoDB ObjectId of the existing structure to claim
 *                 example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *     responses:
 *       201:
 *         description: Structure registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Structure registered successfully
 *                 structure:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                     name:
 *                       type: string
 *                       example: Rifugio Dolomiti
 *                     name_owner:
 *                       type: string
 *                       example: Marco
 *                     surname_owner:
 *                       type: string
 *                       example: Bianchi
 *                     telephone:
 *                       type: string
 *                       example: "+39 0461 123456"
 *       400:
 *         description: Structure not found or already managed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Structure already managed"
 */
router.post("/register_structure", authController.register_structure);
const { login } = require('../controllers/loginController');
router.post('/login', login);
module.exports = router;
