const { SlashCommandBuilder } = require('discord.js');

// แทนที่ 'YOUR_BOT_OWNER_ID' ด้วย ID ของเจ้าของบอท
const BOT_OWNER_ID = '815115791216148521';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency'),
  async execute(interaction) {
    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของบอทหรือไม่
    if (interaction.user.id !== BOT_OWNER_ID) {
      return interaction.reply({
        content: 'คุณไม่มีสิทธิ์ในการใช้คำสั่งนี้',
        ephemeral: true, // ทำให้ข้อความเห็นได้เฉพาะผู้ใช้
      });
    }

    await interaction.reply(`Pong! ${Date.now() - interaction.createdTimestamp}ms`);
  },
};
