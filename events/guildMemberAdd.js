const { Events, EmbedBuilder } = require("discord.js");
const Welcome = require("../database/schemas/welcomeSchema");

module.exports = {
  name: Events.GuildMemberAdd, // Event name for when a new member joins
  async execute(member) {
    try {
      const guildId = member.guild.id;

      // Retrieve welcome message settings from the database
      const welcomeData = await Welcome.findOne({ guildId });
      if (!welcomeData) {
        console.error(`Welcome data not found for guild ID: ${guildId}`);
        return; // Do nothing if no settings are found
      }

      const { channelId, message, imageUrl, borderColor } = welcomeData;
      const channel = member.guild.channels.cache.get(channelId);
      if (!channel) {
        console.error(`Channel not found or inaccessible: ${channelId}`);
        return; // Do nothing if the channel is invalid
      }

      // Get the current member count of the server
      const memberCount = member.guild.memberCount;

      // Customize the welcome message using placeholders
      const welcomeMessage = message
        .replace("{user_name}", member.user.username)
        .replace("{user}", `<@${member.user.id}>`)
        .replace("{server_name}", member.guild.name)
        .replace("{member_count}", memberCount); // Replace with the member count

      // Create an embed for the welcome message
      const embed = new EmbedBuilder()
        .setDescription(welcomeMessage)
        .setColor(borderColor || "#000000") // Use stored color or default to black
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true })); // Display user's avatar as thumbnail

      if (imageUrl) {
        embed.setImage(imageUrl);
      }

      // Send the welcome message as an embed to the specified channel
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Error executing GuildMemberAdd event: ${error.message}`);
    }
  },
};
