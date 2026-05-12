const usersService = require("../services/usersService");

const user_basic_info = async (req, res) => {
  try {
    const info = await usersService.user_basic_info(req.body);
    /*
    if (info.err.name == false) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }
    if (info.expired == true) {
      res.status(401).json({
        message: "token expired",
      });
      return;
    }
*/

    if (info.existing_id == false) {
      res.status(410).json({
        message: "user doesn't exist",
      });
      return;
    }

    console.log("existing id", info.existing_id);
    res.status(200).json({
      message: "User authenticated",
      id: info.id,
      username: info.username,
      expiry: info.expiry,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

module.exports = { user_basic_info };
