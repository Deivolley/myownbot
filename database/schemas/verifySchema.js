// database/schemas/verifySchema.js
const mongoose = require('mongoose');

const verifySchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
    },
    channelId: {
        type: String,
        required: true, // Store the channel ID for verification
    },
    roleId: {
        type: String,
        required: true, // Store the role ID for verification
    },
    code: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 30 * 24 * 60 * 60 // Expires after 30 days
    },
});

module.exports = mongoose.model('Verify', verifySchema);

