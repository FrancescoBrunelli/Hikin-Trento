const Structure = require("../models/Structure");

const fav_structure = async (req, res) => {
  try {
    const structure = await Structure.findById(req.body._id);
    console.log(structure._id);
    let status = "was_there";
    if (!req.user.fav_structures.some((s) => s._id.equals(structure._id))) {
      req.user.fav_structures.push(structure);
      await req.user.save();
      status = "added";
    }
    res.status(200).json({
      status: status,
      fav_structures: req.user.fav_structures,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

module.exports = { fav_structure };
