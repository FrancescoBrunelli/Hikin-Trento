const authMiddleware = require("../middleware/authMiddleware");

const user_basic_info = async (req, res) => {
  authMiddleware(req, res, (req, res) => {
    try {
      res.status(200).json({
        user: req.user,
      });
    } catch (err) {
      res.status(400).json({
        error: err.message,
      });
    }
  });
};

module.exports = { user_basic_info };
