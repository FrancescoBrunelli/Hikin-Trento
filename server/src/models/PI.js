const mongoose = require('mongoose');

const PISchema = new mongoose.Schema(
    {
        osm_id: {type: Number, required: true},
        name: {type: String, required: true},
        coordinates:
            {
                latitude: {type: Number, required: true},
                longitude: {type: Number, required: true}
            },
        shelter_type: {type: String, required: false},
    },
    {timestamps: true}
)

module.exports = mongoose.model('PI', PISchema);
