const express = require ("express");
const router = express.Router();
const authController = require('../controllers/authController');

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
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/register_structure:
 *   post:
 *     summary: Register a new structure
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
 *               - coordinates
 *               - telephone
 *               - password
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
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     example: 46.4102
 *                   longitude:
 *                     type: number
 *                     example: 11.3428
 *                   altitude:
 *                     type: number
 *                     example: 2150
 *               telephone:
 *                 type: string
 *                 example: "+39 0461 123456"
 *               password:
 *                 type: string
 *                 example: rifugio123
 *     responses:
 *       201:
 *         description: Structure registered successfully
 *       400:
 *         description: Structure already exists
 */
router.post('/register_structure', authController.register_structure);


module.exports = router;
