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

const user_update_info = async (req, res) => {
  try {
    req.user.name = req.body.name;
    req.user.surname = req.body.surname;
    req.user.username = req.body.username;
    console.log("pre");
    await req.user.save();
    console.log("post");
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const user_update_password = async (req, res) => {
  try {
    const isMatch = await bcrypt.compare(req.body.curr_password, req.user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is not correct. Try again" });
    }
    if (req.body.new_password !== req.body.confirm_password) {
      return res.status(401).json({ error: "New password is different from confirm new password" });
    }
    req.user.password = req.body.new_password;
    await req.user.save();
    res.status(200).json({
      status: "success",
    })
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
}

module.exports = { user_basic_info, user_update_info, user_update_password };
