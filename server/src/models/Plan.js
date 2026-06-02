const mongoose = require("mongoose");
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
        distance: Number,
        duration: Number,
        ascent: Number,
        descent: Number,
        geometry: {
            type: {
                type: String,
                enum: ['LineString'],
                default: 'LineString'
            },
            coordinates: {
                type: [[Number]],
                required: true
            }
        },
        segments: Array
    },
    multiDay: {
        type: Boolean,
        default: false
    },
    days: {
        type: Number,
        default: 1
    },
    savedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model("Plan", planSchema);