const structuresService = require("../services/structuresService");

const basic_info = async (req, res) => {
  try {
    const { latitude, longitude, radius, show_managed, show_unmanaged } =
      req.query;
    const structures = await structuresService.basic_info({
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      radius: parseFloat(radius),
      show_managed: show_managed === "true",
      show_unmanaged: show_unmanaged === "true",
    });
    res.status(200).json({ structures });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const search = async (req, res) => {
  try {
    const { q, managed } = req.query;
    const filters = {}
    if (managed !== undefined) filters.managed = managed === "true"

    const structures = await structuresService.search(q ?? '', filters);
    res.status(200).json({ structures });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}


const structure_update_info = async (req, res) => {
  try {
    req.managedStructure.name_owner = req.body.name_owner;
    req.managedStructure.surname_owner = req.body.surname_owner;
    req.managedStructure.telephone = req.body.telephone;
    await req.managedStructure.save();
    res.status(200).json({
      status: "success",
      managedstructure: {
        name_owner: req.managedStructure.name_owner,
        surname_owner: req.managedStructure.surname_owner,
        telephone: req.managedStructure.telephone,
      },
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

module.exports = { basic_info, search, structure_update_info };
