const { Events, EmbedBuilder } = require("discord.js");
const Goodbye = require("../database/schemas/goodbyeSchema");

module.exports = {
  name: Events.GuildMemberRemove, // Event name for when a member leaves the server
  async execute(member) {
    const guildId = member.guild.id;

    // Retrieve the goodbye message settings from the database
    const goodbyeData = await Goodbye.findOne({ guildId });

    if (!goodbyeData) return; // Do nothing if no settings are found

    const { channelId, message, imageUrl, borderColor } = goodbyeData;
    const channel = member.guild.channels.cache.get(channelId);

    if (!channel) return; // Do nothing if the channel is invalid

    // Customize the goodbye message using placeholders
    const goodbyeMessage = message
      .replace("{user_name}", member.user.username)
      .replace("{user}", `<@${member.user.id}>`)
      .replace("{server_name}", member.guild.name);

    // Create an embed for the goodbye message with a border color
    const embed = new EmbedBuilder()
      .setDescription(goodbyeMessage)
      .setColor(borderColor || "#000000") // Use stored border color or default to black
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true })); // Set the thumbnail

    if (imageUrl) {
      embed.setImage(imageUrl);
    }

    // Send the goodbye message as an embed to the configured channel
    await channel.send({ embeds: [embed] });
  },
};
