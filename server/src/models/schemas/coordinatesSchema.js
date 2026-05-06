const mongoose = require('mongoose');

const coordinatesSchema = new mongoose.Schema({
  latitude:  { type: Number, required: true },
  longitude: { type: Number, required: true }
});

module.exports = mongoose.model('Coordinate', coordinatesSchema);