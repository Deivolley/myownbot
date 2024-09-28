const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const Goodbye = require("../database/schemas/goodbyeSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setgoodbye")
    .setDescription("ตั้งค่าข้อความลากล่าวสำหรับสมาชิกที่ออกจากเซิร์ฟเวอร์")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription(
          "ข้อความลากล่าวที่มีตัวยึด {user_name}, {user}, {server_name}, และ {user_avatar}",
        )
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("channel")
        .setDescription("ID ของช่องที่ข้อความลากล่าวจะถูกส่งไป")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("image")
        .setDescription(
          "URL ของรูปภาพหรือ GIF ที่จะใส่ในข้อความลากล่าว (ไม่บังคับ)",
        ),
    )
    .addStringOption((option) =>
      option
        .setName("border_color")
        .setDescription("รหัสสี Hex สำหรับขอบ (เช่น #FF5733)")
        .setRequired(false),
    ),
  async execute(interaction) {
    // ตรวจสอบสิทธิ์ ADMINISTRATOR
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "คุณไม่มีสิทธิ์ในการใช้คำสั่งนี้",
        ephemeral: true,
      });
    }

    const message = interaction.options.getString("message");
    const channelId = interaction.options.getString("channel");
    const imageUrl = interaction.options.getString("image");
    const borderColor =
      interaction.options.getString("border_color") || "#000000"; // ค่าเริ่มต้นเป็นสีดำ
    const guildId = interaction.guild.id;

    // ตรวจสอบว่าช่องที่ระบุมีอยู่ในเซิร์ฟเวอร์หรือไม่
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) {
      return interaction.reply({
        content: "ID ของช่องที่ระบุไม่ถูกต้อง",
        ephemeral: true,
      });
    }

    // บันทึกข้อความลากล่าว รูปภาพ (ถ้ามี) และสีขอบลงในฐานข้อมูล
    await Goodbye.findOneAndUpdate(
      { guildId },
      { channelId, message, imageUrl, borderColor },
      { upsert: true },
    );

    // ยืนยันการตั้งค่าข้อความลากล่าว
    await interaction.reply(`ข้อความลากล่าวถูกตั้งค่าสำหรับ <#${channelId}>`);

    // เตรียมข้อความลากล่าวตัวอย่าง
    const sampleMessage = message
      .replace("{user_name}", interaction.user.username)
      .replace("{user}", `<@${interaction.user.id}>`)
      .replace("{server_name}", interaction.guild.name)
      

    // สร้าง embed สำหรับข้อความลากล่าวพร้อมสีขอบที่กำหนด
    const embed = new EmbedBuilder()
      .setDescription(sampleMessage)
      .setColor(borderColor) // กำหนดสีขอบ
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true })); // แสดงรูปโปรไฟล์ของผู้ใช้เป็น thumbnail

    if (imageUrl) {
      embed.setImage(imageUrl);
    }

    // ส่งข้อความลากล่าวตัวอย่างเป็น embed ไปยังช่องที่กำหนด
    await channel.send({ embeds: [embed] });
  },
};
