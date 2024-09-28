const mongoose = require("mongoose");

const goodbyeSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
    message: { type: String, required: true },
    imageUrl: { type: String }, // Optional field for image or GIF URL
    borderColor: { type: String }, // Optional field for border color
  },
  {
    timestamps: true, // Optional: To track when records are created/updated
  },
);

module.exports = mongoose.model("Goodbye", goodbyeSchema);
