const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const Goodbye = require("../database/schemas/goodbyeSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("testgoodbye")
    .setDescription("ทดสอบข้อความอำลา"),
  
  async execute(interaction) {
    // ตรวจสอบว่าผู้ใช้มีสิทธิ์ผู้ดูแลระบบหรือไม่
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "คุณไม่มีสิทธิ์ในการใช้คำสั่งนี้.", 
        ephemeral: true,
      });
    }

    const guildId = interaction.guild.id;

    // ดึงข้อมูลการตั้งค่าข้อความอำลาจากฐานข้อมูล
    const goodbye = await Goodbye.findOne({ guildId });
    if (!goodbye) {
      return interaction.reply({
        content: "ข้อความอำลาไม่ได้ตั้งค่าไว้!", 
        ephemeral: true,
      });
    }

    const channel = interaction.guild.channels.cache.get(goodbye.channelId);
    if (!channel) {
      return interaction.reply({
        content: "ไม่พบช่องที่ระบุ!", 
        ephemeral: true,
      });
    }

    // ปรับแต่งข้อความอำลาตามตัวแทนที่กำหนด
    const goodbyeMessage = goodbye.message
      .replace("{user_name}", interaction.user.username)
      .replace("{user}", `<@${interaction.user.id}>`)
      .replace("{server_name}", interaction.guild.name);

    // สร้าง embed สำหรับข้อความอำลาพร้อมสีขอบ
    const embed = new EmbedBuilder()
      .setDescription(goodbyeMessage)
      .setColor(goodbye.borderColor || "#000000") // ใช้สีขอบที่บันทึกไว้หรือเริ่มต้นเป็นสีดำ
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

    // รวมรูปภาพหากระบุไว้
    if (goodbye.imageUrl) {
      embed.setImage(goodbye.imageUrl);
    }

    // ส่งข้อความอำลาพร้อม embed ไปยังช่องที่ตั้งค่าไว้
    await channel.send({ embeds: [embed] });

    // แจ้งเตือนผู้ใช้ว่าข้อความอำลาถูกส่งแล้ว
    await interaction.reply({
      content: "ข้อความอำลาได้ถูกส่งแล้ว!",
      ephemeral: true,
    });
  },
};
