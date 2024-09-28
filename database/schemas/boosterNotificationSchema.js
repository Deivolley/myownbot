// boosterNotificationSchema.js
const mongoose = require('mongoose');

const boosterNotificationSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  channelId: { type: String, required: true },
});

module.exports = mongoose.model('BoosterNotification', boosterNotificationSchema);
