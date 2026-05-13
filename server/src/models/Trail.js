const mongoose = require("mongoose")

const trailSchema = new mongoose.Schema(
    {
        osm_id: {type: Number, required: true},
        name: {type: String, required: false},
        ref: {type: String, required: false},
        reg_ref: {type: String, required: false},
        difficulty: {type: String, required: false},
        distance_km: {type: Number, required: false},
        ascent_m: {type: Number, required: false},
        descent_m: {type: Number, required: false},
        duration_forward: {type: String, required: false},
        duration_backward: {type: String, required: false},
        from: {type: String, required: false},
        to: {type: String, required: false},
        roundtrip: {type: Boolean, required: true},
        operator: {type: String, required: false},
        website: {type: String, required: false},
        bounds: {
            minlat: {type: Number, required: true},
            minlon: {type: Number, required: true},
            maxlat: {type: Number, required: true},
            maxlon: {type: Number, required: true}
        },
        geometry: {
            type: {type: String, required: true},
            enum: ["LineString"],
            coordinates: {type: [[Number]], required: true}
        }
    },
    {timestamps: true}
)

// In order to ensure $near and $geoWithin queries to work properly
trailSchema.index({geometry: "2dsphere"})

module.exports = mongoose.model("Trail", trailSchema)