const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const Welcome = require("../database/schemas/welcomeSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setwelcome")
    .setDescription("ตั้งค่าข้อความต้อนรับสำหรับสมาชิกใหม่")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription(
          "ข้อความต้อนรับพร้อมตัวยึด {user_name}, {user}, {server_name}, {member_count}.",
        )
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel ID สำหรับข้อความ.")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("image").setDescription("URL รูปภาพหรือ GIF (ไม่จำเป็น)."),
    )
    .addStringOption((option) =>
      option
        .setName("border_color")
        .setDescription("รหัสสี Hex สำหรับขอบ.")
        .setRequired(false),
    ),
  async execute(interaction) {
    // ตรวจสอบว่าผู้ใช้มีสิทธิ์ ADMINISTRATOR หรือไม่
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "คุณไม่มีสิทธิ์ที่จำเป็นในการใช้คำสั่งนี้.",
        ephemeral: true,
      });
    }

    const message = interaction.options.getString("message");
    const channelId = interaction.options.getString("channel");
    const imageUrl = interaction.options.getString("image");
    const borderColor =
      interaction.options.getString("border_color") || "#000000"; // ค่าเริ่มต้นคือสีดำ
    const guildId = interaction.guild.id;

    // ตรวจสอบว่าช่องที่ระบุมีอยู่หรือไม่
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) {
      return interaction.reply({
        content: "Channel ID ที่ระบุไม่ถูกต้อง.",
        ephemeral: true,
      });
    }

    // บันทึกข้อความต้อนรับ รูปภาพ (ถ้ามี) และสีขอบลงในฐานข้อมูล
    await Welcome.findOneAndUpdate(
      { guildId },
      { channelId, message, imageUrl, borderColor },
      { upsert: true },
    );

    // ส่งข้อความยืนยันไปยังช่องที่ทำการโต้ตอบ
    await interaction.reply(`ข้อความต้อนรับถูกตั้งค่าสำหรับ <#${channelId}>`);

    // เตรียมข้อความต้อนรับตัวอย่าง
    const memberCount = interaction.guild.memberCount;
    const sampleMessage = message
      .replace("{user_name}", interaction.user.username)
      .replace("{user}", `<@${interaction.user.id}>`)
      .replace("{server_name}", interaction.guild.name)
      .replace("{member_count}", memberCount); // แทนที่ด้วยจำนวนสมาชิกปัจจุบัน

    // สร้าง embed พร้อมกับสีขอบและรูปโปรไฟล์ผู้ใช้
    const embed = new EmbedBuilder()
      .setDescription(sampleMessage)
      .setColor(borderColor)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true })); // เพิ่มรูปโปรไฟล์เป็น thumbnail

    if (imageUrl) {
      embed.setImage(imageUrl);
    }

    // ส่งข้อความต้อนรับตัวอย่างเป็น embed ไปยังช่องที่ระบุ
    await channel.send({ embeds: [embed] });
  },
};
