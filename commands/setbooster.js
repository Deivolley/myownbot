const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setbooster')
    .setDescription('กำหนดช่องทางสำหรับการแจ้งเตือนเมื่อมีคนบูสต์เซิร์ฟเวอร์')
    .addChannelOption(option =>
      option
        .setName('ช่องทาง')
        .setDescription('เลือกช่องทางที่ต้องการแจ้งเตือน')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // จำกัดให้ผู้ที่มีสิทธิ์ Administrator ใช้ได้

  async execute(interaction) {
    // ตรวจสอบว่าผู้ใช้มีสิทธิ์ Administrator หรือไม่
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        content: 'คำเตือน: คุณไม่มีสิทธิ์ในการใช้งานคำสั่งนี้',
        ephemeral: true, // ทำให้การตอบกลับนี้มองเห็นได้เฉพาะผู้ที่เรียกใช้คำสั่งนี้เท่านั้น
      });
      return;
    }

    const channel = interaction.options.getChannel('ช่องทาง');
    const guildId = interaction.guild.id;

    try {
      // บันทึกข้อมูลช่องทางที่เลือกลงในฐานข้อมูล
      await require('../database/schemas/boosterNotificationSchema').findOneAndUpdate(
        { guildId },
        { channelId: channel.id },
        { upsert: true, new: true }
      );

      await interaction.reply({
        content: `ช่องทางแจ้งเตือนบูสเตอร์ได้ถูกตั้งค่าไว้ที่ ${channel} เรียบร้อยแล้ว!`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการตั้งค่าช่องทางแจ้งเตือน:', error);
      await interaction.reply({
        content: 'เกิดข้อผิดพลาดในการตั้งค่าช่องทางแจ้งเตือน',
        ephemeral: true,
      });
    }
  },
};