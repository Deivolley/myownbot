const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("แสดงข้อมูลช่วยเหลือในภาษาไทย")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("เลือกคำสั่งที่ต้องการข้อมูลเพิ่มเติม")
        .setRequired(false)
        .addChoices(
          { name: "/setwelcome", value: "setwelcome" },
          { name: "/setgoodbye", value: "setgoodbye" },
          { name: "/setverify", value: "setverify" },
          { name: "/ping", value: "ping" },
          { name: "/testwelcome", value: "testwelcome" },
          { name: "/testgoodbye", value: "testgoodbye" },
          { name: "/setBooster", value: "setBooster" }, 
          { name: "/inviteLink", value: "inviteLink" }  // Added new choice
        )
    ),
  async execute(interaction) {
    const command = interaction.options.getString("command");

    const commandsInfo = {
      setwelcome: {
        title: "/setwelcome",
        description:
          "**ตั้งค่าข้อความต้อนรับเมื่อมีสมาชิกใหม่เข้าร่วมเซิร์ฟเวอร์**\n" +
          "🔸 สามารถปรับแต่งข้อความด้วยตัวแปร {user_name}, {user}, {server_name}.\n" +
          "🔸 เพิ่มรูปภาพหรือ GIF ได้โดยใช้ URL.",
      },
      setgoodbye: {
        title: "/setgoodbye",
        description:
          "**ตั้งค่าข้อความลาจากเมื่อสมาชิกออกจากเซิร์ฟเวอร์**\n" +
          "🔸 สามารถปรับแต่งข้อความด้วยตัวแปร {user_name}, {user}, {server_name}.\n" +
          "🔸 เพิ่มรูปภาพหรือ GIF ได้โดยใช้ URL.",
      },
      setverify: {
        title: "/setverify",
        description:
          "**ตั้งค่ากระบวนการยืนยันตัวตนสำหรับสมาชิกใหม่**\n" +
          "🔸 หลังการยืนยันสำเร็จ สมาชิกจะได้รับบทบาทที่กำหนด.",
      },
      ping: {
        title: "/ping",
        description:
          "**ตรวจสอบปิงของบอท**\n" +
          "🔸 วัดความเร็วในการตอบสนองระหว่างบอทกับเซิร์ฟเวอร์.",
      },
      testwelcome: {
        title: "/testwelcome",
        description:
          "**ทดสอบข้อความต้อนรับที่ตั้งค่าไว้**\n" +
          "🔸 ข้อความจะถูกส่งไปยังช่องที่กำหนดเพื่อดูตัวอย่างการทำงาน.",
      },
      testgoodbye: {
        title: "/testgoodbye",
        description:
          "**ทดสอบข้อความลาจากที่ตั้งค่าไว้**\n" +
          "🔸 ข้อความจะถูกส่งไปยังช่องที่กำหนดเพื่อดูตัวอย่างการทำงาน.",
      },
      setBooster: {
        title: "/setBooster",
        description:
          "**ตั้งค่าข้อความต้อนรับสำหรับสมาชิกที่เป็น Booster ของเซิร์ฟเวอร์**\n" +
        "🔸 ข้อความนี้จะปรากฏเมื่อสมาชิกที่เป็น Booster เข้าร่วมเซิร์ฟเวอร์.",
      },
      inviteLink: { // New command info
        title: "/inviteLink",
        description:
          "**สร้างลิ้งคำเชิญเพื่อเชิญสมาชิกใหม่เข้าร่วมเซิร์ฟเวอร์**\n" +
          "🔸 คุณสามารถตั้งค่าการหมดอายุและจำนวนการใช้งานของลิ้งคำเชิญได้.\n" +
          "🔸  กดเพื่อไปทีเซิร์ฟเวอร์ซัพพอร์ต.",
      },
    };

    if (command && commandsInfo[command]) {
      const embed = new EmbedBuilder()
        .setTitle(commandsInfo[command].title)
        .setDescription(commandsInfo[command].description)
        .setColor("#00FFFF") // You can set your preferred color
        .setFooter({ text: "ข้อมูลเพิ่มเติมเกี่ยวกับคำสั่ง" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      const embed = new EmbedBuilder()
        .setTitle("✦ คำสั่งที่รองรับ ✦")
        .setDescription(
          "🔹 **/setwelcome** `[ข้อความ] [ช่อง]`\n" +
            "    ┗━ ➥ ตั้งค่าข้อความต้อนรับสำหรับสมาชิกใหม่.\n\n" +
            "🔹 **/setgoodbye** `[ข้อความ] [ช่อง]`\n" +
            "    ┗━ ➥ ตั้งค่าข้อความลาจากสำหรับสมาชิกที่ออกจากเซิร์ฟเวอร์.\n\n" +
            "🔹 **/setverify** `[ข้อความ] [ช่อง] [บทบาท]`\n" +
            "    ┗━ ➥ ตั้งค่ากระบวนการยืนยันตัวตนของสมาชิกใหม่.\n\n" +
            "🔹 **/ping**\n" +
            "    ┗━ ➥ ตรวจสอบปิงของบอท.\n\n" +
            "🔹 **/testwelcome**\n" +
            "    ┗━ ➥ ทดสอบข้อความต้อนรับ.\n\n" +
            "🔹 **/testgoodbye**\n" +
            "    ┗━ ➥ ทดสอบข้อความลาจาก.\n\n" +
            "🔹 **/setBooster** ` [ช่อง]`\n" +
            "    ┗━ ➥ ตั้งค่าข้อความต้อนรับสำหรับสมาชิกที่เป็น Booster.\n\n" +
            "🔹 **/inviteLink**\n" +
            "    ┗━ ➥ สร้างลิ้งคำเชิญเพื่อเชิญสมาชิกใหม่เข้าร่วมเซิร์ฟเวอร์.\n\n" +
            " กดเพื่อไปทีเซิร์ฟเวอร์ซัพพอร์ต `/help [command]`"
        )
        .setColor("#00FFFF") // You can set your preferred color
        .setFooter({ text: "ข้อมูลเพิ่มเติมเกี่ยวกับคำสั่ง" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
