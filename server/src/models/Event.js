const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema (
    {
        structure_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ManagedStructure',
            required: true,
            index: true
        },
        title: {type: String, required: true},
        description: {type: String, required: true},
        start_date: {type: Date, required: true},
        end_date: {type: Date, required: true},
    }, {timestamps: true}
)

module.exports = mongoose.model('Event', eventSchema);
