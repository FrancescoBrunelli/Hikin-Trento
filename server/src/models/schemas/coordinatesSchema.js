//const mongoose = require('mongoose');

//const coordinatesSchema = new mongoose.Schema({
//  latitude:  {type: Number, required: true },
//  longitude: {type: Number, required: true },
//  altitude:  {type: Number, required: true }
//});

//module.exports = coordinatesSchema; 

const mongoose = require('mongoose');

const coordinatesSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },

  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },

  altitude: {
    type: Number,
    default: 0
  }
});

module.exports = coordinatesSchema;