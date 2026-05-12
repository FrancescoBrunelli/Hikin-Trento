const User = require("../models/User");
const jwt = require("jsonwebtoken");

const user_basic_info = async ({ token }) => {
  const info = Object.create({});
  decoded = jwt.verify(token, process.env.JWT_SECRET);

  console.log("decoded", decoded);
  info.err = err;
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
