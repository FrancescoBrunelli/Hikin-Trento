const mongoose  = require("mongoose");
const User = require("./User");
const coordinatesSchema = require("./schemas/coordinatesSchema");
const waypointSchema = new mongoose.Schema({
    coordinates: {
        type: coordinatesSchema,
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
    }
});

const planSchema = new mongoose.Schema({
    user: {
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
    start: {
        type: waypointSchema,
        required: true
    },

    end: {
        type: waypointSchema,
        required: true
    },
    waypoints: [waypointSchema],
    route: {
        distance: Number,      // meters
        duration: Number,      // seconds
        ascent: Number,       // meters elevation gain
        descent: Number,      // meters elevation loss
        geometry: {
            type: {
                type: String,
                enum: ['LineString'],
                default: 'LineString'
            },

            coordinates: {
                type: [[Number]], // [[lng, lat], [lng, lat]]
                required: true
            }
        },     // encoded polyline for map
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