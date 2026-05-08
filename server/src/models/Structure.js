const mongoose = require("mongoose");
const coordinatesSchema = require("./schemas/coordinatesSchema");

const structureSchema = new mongoose.Schema(
  {
    oth_id: { type: String, required: true },
    name: { type: String, required: true },
    coordinates: { type: coordinatesSchema, required: true },
    managed: { type: Boolean, required: true },
  },
  { timestamps: true },
);


module.exports = mongoose.model("Structure", structureSchema);

