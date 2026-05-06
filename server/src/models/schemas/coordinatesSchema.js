const mongoose = require('mongoose');

const coordinatesSchema = new mongoose.Schema({
  latitude:  {type: Number, required: true },
  longitude: {type: Number, required: true },
  altitude:  {type: Number, required: true }
});

module.exports = coordinateSchema; 