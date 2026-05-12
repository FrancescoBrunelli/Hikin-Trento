const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.get("/basicInfo", usersController.user_basic_info);

module.exports = router;
