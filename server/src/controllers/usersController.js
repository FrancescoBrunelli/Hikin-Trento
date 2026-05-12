const authMiddleware = require("../middleware/authMiddleware");

const user_basic_info = async (req, res) => {
  authMiddleware(req, res, (req, res) => {
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
  });
};

module.exports = { user_basic_info };
