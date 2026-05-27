const mongoose  = require("mongoose");
const User = require("./User");
const coordinatesSchema = require("./schemas/coordinatesSchema");
const waypointSchema = new mongoose.Schema({
    coordinates: {
        type: coordinatesSchema, // [longitude, latitude]
        required: true
    },
    type: {
        type: String,
        enum: ['structure', 'POI', 'custom'],
        default: 'custom'
    },
    ReferenceID: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    name: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: ''
        // e.g. 'rifugio', 'cascata', 'caverna', 'bivacco', 'belvedere', 'area picnic', 'parcheggio', etc.
    } 
});

const planSchema = new mongoose.Schema({
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
//    shareToken: {
//      type: String,
//        unique: true,
//        sparse: true,  // only unique when not null
//        default: null
//    },
//    isPublic: {
//        type: Boolean,
//        default: false
//    },
    Start: {
        coordinates: { type: waypointSchema, required: true },  // [lng, lat]
        name: { type: String, default: '' }, // [longitude, latitude]
        
    },
    End: {
        coordinates: { type:waypointSchema, required: true },  // [lng, lat]
        name: { type: String, default: '' }, // [longitude, latitude]
    },
    Waypoints: [waypointSchema],
    route: {
        distance: Number,      // meters
        duration: Number,      // seconds
        ascent: Number,       // meters elevation gain
        descent: Number,      // meters elevation loss
        geometry: String,     // encoded polyline for map
        segments: Array       // turn by turn instructions
    },
    multiDay: {
        type: Boolean,
        default: false
    },
    days: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

module.exports = mongoose.model("Plan", planSchema);