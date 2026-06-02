const mongoose = require('mongoose');

const announcementsSchema = new mongoose.Schema (
    {
        structure_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ManagedStructure',
            required: true,
            index: true
        },
        title: {type: String, required: true},
        description: {type: String, required: true},
    }, {timestamps: true}
)

module.exports = mongoose.model('Announcement', announcementsSchema);
