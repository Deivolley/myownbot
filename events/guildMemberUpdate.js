const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember, newMember, client) {
    // Check if the member has just boosted the server
    if (!oldMember.premiumSince && newMember.premiumSince) {
      const guildId = newMember.guild.id;

      // Fetch the notification settings from the database
      const notificationSettings = await require('../database/schemas/boosterNotificationSchema').findOne({ guildId });

      if (!notificationSettings || !notificationSettings.channelId) {
        console.log(`ไม่พบการตั้งค่าช่องทางแจ้งเตือนสำหรับเซิร์ฟเวอร์: ${guildId}`);
        return;
      }

      const channel = newMember.guild.channels.cache.get(notificationSettings.channelId);
      if (!channel) {
        console.error("ไม่พบช่องทางที่ตั้งค่าไว้สำหรับแจ้งเตือน");
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle("🎉 ขอบคุณสำหรับการบูสต์เซิร์ฟเวอร์! 🎉")
        .setDescription(`${newMember.user.tag} ได้บูสต์เซิร์ฟเวอร์! ขอบคุณสำหรับการสนับสนุน!`)
        .setColor("#FF73FA")
        .setTimestamp();

      try {
        await channel.send({ embeds: [embed] });
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการส่งข้อความแจ้งเตือน:", error);
      }
    }
  },
};
