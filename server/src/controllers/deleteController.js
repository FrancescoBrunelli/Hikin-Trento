const bcrypt = require("bcrypt");
const { findById } = require("../models/ManagedStructure");
const Structure = require("../models/Structure");

const delete_user = async (req, res) => {
  try {
    const { password } = req.body;
    const isMatch = await bcrypt.compare(password, req.user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: "The password is not correct",
      });
    }
    await req.user.deleteOne();
    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

const delete_managed_structure = async (req, res) => {
  const { password } = req.body;
  try {
    const isMatch = await bcrypt.compare(
      password,
      req.managedStructure.password,
    );
    if (!isMatch) {
      return res.status(401).json({
        error: "The password is not correct",
      });
    }
    const structure = await Structure.findById(req.managedStructure.structure._id);
    await req.managedStructure.deleteOne();
    if (structure) {
          structure.managed = false;
          await structure.save();  // ← await
        }
    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

module.exports = { delete_user, delete_managed_structure };
