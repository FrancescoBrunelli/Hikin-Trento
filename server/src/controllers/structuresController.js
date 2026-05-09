const structuresService = require("../services/structuresService");

const basic_info = async (req, res) => {
  try {
    const structures = await structuresService.basic_info(req.body);
    res.status(201).json({
      message: "get all structures ",
      structures: structures,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { basic_info: basic_info };
