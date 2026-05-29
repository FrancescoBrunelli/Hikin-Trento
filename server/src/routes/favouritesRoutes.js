const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const favouritesController = require("../controllers/favouritesController");

router.put("/structures", authMiddleware, favouritesController.fav_structure);

module.exports = router;
