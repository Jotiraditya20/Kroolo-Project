const mongoose = require('mongoose');

const epicSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    project_id: {
        type: String,
        required: true
    },
    effort: {
        type: String,
        enum: ['L', 'M', 'S'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    objective: {
        type: String,
        required: true
    },
    scope: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['generated', 'validated', 'edited', 'Done'],
        default: 'generated'
    },
    ai_validation: {
        passed: {
            type: Boolean,
            default: false
        },
        issues: [{
            type: String
        }],
        suggested_changes: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        }
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    collection: 'epics' // Explicitly set the collection name
});

const Epic = mongoose.model('Epic', epicSchema);

module.exports = Epic;
