const mongoose = require("mongoose");

const welcomeSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true },
    message: { type: String, required: true },
    imageUrl: { type: String }, // Optional field for image or GIF URL
    borderColor: { type: String, default: "#000000" }, // Optional field for border color with default value
  },
  {
    timestamps: true, // Optional: To track when records are created/updated
  },
);

module.exports = mongoose.model("Welcome", welcomeSchema);
