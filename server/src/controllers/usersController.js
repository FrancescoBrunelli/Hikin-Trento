const authMiddleware = require("../middleware/authMiddleware");
const bcrypt = require("bcrypt");

const user_basic_info = async (req, res) => {
  console.log(req);
  try {
    const user = req.user;
    res.status(200).json({
      user_id: user._id,
      username: user.username,
      name: user.name,
      surname: user.surname,
      date_of_birth: user.date_of_birth,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

/**
 * Updates the basic information of the authenticated user.
 * Modifies name, surname and username of the user attached to the request by the auth middleware.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.user - The authenticated user document (attached by authMiddleware)
 * @param {Object} req.body - The request body
 * @param {string} req.body.name - The new first name
 * @param {string} req.body.surname - The new last name
 * @param {string} req.body.username - The new username
 * @param {Object} res - Express response object
 * @returns {Promise<void>} 200 if updated successfully, 400 if an error occurs
 * @throws {Error} If saving to the database fails (e.g. duplicate username)
 */
const user_update_info = async (req, res) => {
  try {
    req.user.name = req.body.name;
    req.user.surname = req.body.surname;
    req.user.username = req.body.username;
    await req.user.save();
    res.status(200).json({
      status: "success",
      user: {
        name: req.user.name,
        surname: req.user.surname,
        username: req.user.username,
        date_of_birth: req.user.date_of_birth,
      },
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

/**
 * Update authenticated user's password.
 *
 * @async
 * @function user_update_password
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.curr_password - Current user password
 * @param {string} req.body.new_password - New password
 * @param {string} req.body.confirm_password - Confirmation of the new password
 * @param {Object} req.user - Authenticated user injected by auth middleware
 * @param {Object} res - Express response object
 *
 * @returns {Object} 200 - Success message
 * @returns {Object} 401 - Invalid current password or password mismatch
 * @returns {Object} 400 - Generic server error
 */
const user_update_password = async (req, res) => {
  try {
    const isMatch = await bcrypt.compare(
      req.body.curr_password,
      req.user.password,
    );
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Current password is not correct. Try again" });
    }
    if (req.body.new_password !== req.body.confirm_password) {
      return res
        .status(401)
        .json({ error: "New password is different from confirm new password" });
    }
    req.user.password = req.body.new_password;
    await req.user.save();
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

module.exports = { user_basic_info, user_update_info, user_update_password };
