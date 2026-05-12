const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

console.log("bcrypt loaded:", bcrypt);


/**
 * Authenticates a user using username and password credentials.
 *
 * This function:
 * 1. Checks whether the user exists in the database.
 * 2. Verifies the provided password using bcrypt.
 * 3. Generates a JWT authentication token valid for 24 hours.
 * 4. Returns the authenticated user's basic information.
 *
 * @async
 * @function login
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body containing login credentials.
 * @param {string} req.body.username - User username.
 * @param {string} req.body.password - User password.
 * @param {Object} res - Express response object.
 *
 * @returns {Promise<void>} Sends a JSON response containing:
 * - success message
 * - JWT token
 * - authenticated user information
 *
 * @throws {Error} Returns HTTP 500 if an unexpected server error occurs.
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    //1. Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    //2. Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    //3. Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        date_of_birth: user.date_of_birth,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed: " + err.message });
  }
};
module.exports = { login };
