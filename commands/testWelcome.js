const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const Welcome = require("../database/schemas/welcomeSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("testwelcome")
    .setDescription("ทดสอบข้อความต้อนรับ"),
  async execute(interaction) {
    // ตรวจสอบว่าผู้ใช้มีสิทธิ์ผู้ดูแลระบบหรือไม่
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "คุณไม่มีสิทธิ์ในการใช้คำสั่งนี้.",
        ephemeral: true, // ทำให้ข้อความเห็นได้เฉพาะผู้ใช้
      });
    }

    const guildId = interaction.guild.id;

    // ดึงการตั้งค่าข้อความต้อนรับจากฐานข้อมูล
    const welcome = await Welcome.findOne({ guildId });
    if (!welcome) {
      return interaction.reply({
        content: "ข้อความต้อนรับยังไม่ได้ตั้งค่า!",
        ephemeral: true, // ทำให้ข้อความเห็นได้เฉพาะผู้ใช้
      });
    }

    const channel = interaction.guild.channels.cache.get(welcome.channelId);
    if (!channel) {
      return interaction.reply({
        content: "ไม่พบช่องที่ระบุ!",
        ephemeral: true, // ทำให้ข้อความเห็นได้เฉพาะผู้ใช้
      });
    }

    // ดึงจำนวนสมาชิกปัจจุบันของเซิร์ฟเวอร์
    const memberCount = interaction.guild.memberCount;

    // ปรับแต่งข้อความต้อนรับโดยใช้ตัวแทน
    const welcomeMessage = welcome.message
      .replace("{user_name}", interaction.user.username)
      .replace("{user}", `<@${interaction.user.id}>`)
      .replace("{server_name}", interaction.guild.name)
      .replace("{member_count}", memberCount); // ใช้จำนวนสมาชิก

    // สร้าง embed สำหรับข้อความต้อนรับพร้อมสีขอบและรูปโปรไฟล์
    const embed = new EmbedBuilder()
      .setDescription(welcomeMessage)
      .setColor(welcome.borderColor || "#000000") // ใช้สีเริ่มต้นหากไม่ได้ตั้งค่า
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true })); // แสดงรูปโปรไฟล์ผู้ใช้

    if (welcome.imageUrl) {
      embed.setImage(welcome.imageUrl);
    }

    // ส่งข้อความต้อนรับในรูปแบบ embed ไปยังช่องที่ตั้งค่าไว้
    await channel.send({ embeds: [embed] });

    // แจ้งเตือนผู้ใช้ว่าข้อความต้อนรับถูกส่งแล้ว
    await interaction.reply({
      content: "ข้อความต้อนรับได้ถูกส่งแล้ว!",
      ephemeral: true, // ทำให้ข้อความเห็นได้เฉพาะผู้ใช้
    });
  },
};
