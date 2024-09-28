const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invitelink")
    .setDescription("สร้างลิ้งคำเชิญเพื่อเชิญบอทและเข้าร่วมเซิร์ฟเวอร์ซัพพอร์ต"),
  
  async execute(interaction) {
    // Replace these URLs with your actual bot invite link and support server link
    const botInviteLink = "https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands";
    const supportServerLink = "https://discord.gg/YOUR_SUPPORT_SERVER_INVITE";

    // Create buttons
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel("เชิญบอท")
          .setURL(botInviteLink)
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setLabel("เข้าร่วมเซิร์ฟเวอร์ซัพพอร์ต")
          .setURL(supportServerLink)
          .setStyle(ButtonStyle.Link)
      );

    await interaction.reply({ 
      content: "คุณสามารถเชิญบอทเข้าร่วมเซิร์ฟเวอร์ของคุณหรือติดต่อเราได้โดยใช้ลิ้งค์ด้านล่าง:", 
      components: [row], 
      ephemeral: true 
    });
  }
};
