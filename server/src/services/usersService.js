const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * Retrieves basic information about a user from a JWT token.
 * Verifies the token, decodes it, and checks if the user still exists in the database.
 *
 * @param {string} token - The JWT token to verify and decode
 * @returns {Promise<Object>} An object containing the following fields:
 * @returns {boolean} returns.existing_id - Whether the user still exists in the database
 * @returns {string} [returns.username] - The username decoded from the token
 * @returns {string} [returns.id] - The MongoDB ObjectId of the user
 * @returns {number} [returns.expiry] - The token expiry timestamp in Unix format
 * @throws {Error} If the token is invalid or expired
 * @throws {Error} If JWT_SECRET is not defined in environment variables
 */
const user_basic_info = async (token) => {
  const info = Object.create({});
  decoded = jwt.verify(token, process.env.JWT_SECRET);

  console.log("decoded", decoded);
  info.existing_id = true;
  if (decoded != undefined) {
    info.username = decoded.username;
    info.id = decoded.userId;
    info.expiry = decoded.exp;
    const user = await User.findById(decoded.userId);

    console.log("user", user);
    if (user == null) {
      info.existing_id = false;
    }
  }
  return info;
};

module.exports = { user_basic_info };
