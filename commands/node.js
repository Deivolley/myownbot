const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("node")
    .setDescription("แสดงข้อมูลการใช้งานของ CPU และหน่วยความจำ"),

  async execute(interaction) {
    // ใส่ ID ของเจ้าของบอททั้ง 3 คน
    const botOwnerIds = ["815115791216148521", "731022611521208340", "939756536497074178"]; // แทนที่ด้วย ID ผู้ใช้ Discord ที่ต้องการ

    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของบอทหรือไม่
    if (!botOwnerIds.includes(interaction.user.id)) {
      return interaction.reply({
        content: "ขออภัย คำสั่งนี้สามารถใช้ได้โดยเจ้าของบอทเท่านั้น!",
        ephemeral: true,
      });
    }

    // เริ่มการวัดการใช้งาน CPU
    const startUsage = process.cpuUsage();
    const startTime = Date.now();

    // รอเวลาสั้นๆ เพื่อวัดการใช้งาน CPU
    await new Promise(resolve => setTimeout(resolve, 1000));

    const endUsage = process.cpuUsage(startUsage);
    const endTime = Date.now();
    const elapsedTime = (endTime - startTime) / 1000; // แปลงเป็นวินาที

    // คำนวณการใช้งาน CPU เป็นเปอร์เซ็นต์
    const userCPUPercent = ((endUsage.user / 1000) / (elapsedTime * 1000) * 100).toFixed(2);
    const systemCPUPercent = ((endUsage.system / 1000) / (elapsedTime * 1000) * 100).toFixed(2);
    const totalCPUPercent = parseFloat(userCPUPercent) + parseFloat(systemCPUPercent);

    // คำนวณการใช้งาน CPU
    const cpuLoad = os.loadavg()[0]; // โหลดเฉลี่ยใน 1 นาที

    // คำนวณการใช้งานหน่วยความจำ
    const totalMemory = os.totalmem(); // หน่วยความจำทั้งหมด
    const freeMemory = os.freemem();   // หน่วยความจำที่ยังว่าง
    const usedMemory = totalMemory - freeMemory; // หน่วยความจำที่ใช้งานอยู่
    const memoryUsagePercent = (usedMemory / totalMemory * 100).toFixed(2);
    
    // แปลงหน่วยความจำเป็น MB และ GB
    const totalMemoryMB = (totalMemory / (1024 * 1024)).toFixed(2);
    const usedMemoryMB = (usedMemory / (1024 * 1024)).toFixed(2);
    const totalMemoryGB = (totalMemory / (1024 * 1024 * 1024)).toFixed(2);
    const usedMemoryGB = (usedMemory / (1024 * 1024 * 1024)).toFixed(2);

    // คำนวณเวลาที่บอทออนไลน์
    const uptime = os.uptime();
    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    // ดึงจำนวนเซิร์ฟเวอร์ที่บอทอยู่
    const serverCount = interaction.client.guilds.cache.size;

    // สร้าง Embed เพื่อแสดงข้อมูล
    const embed = new EmbedBuilder()
      .setTitle("ข้อมูลการใช้งานของ CPU และหน่วยความจำ")
      .setDescription("ข้อมูลที่เกี่ยวข้องกับการใช้งาน CPU และหน่วยความจำของเซิร์ฟเวอร์:")
      .addFields(
        { name: "```📈 การใช้ CPU (การทำงานจริง)```", value: `\`\`\` ผู้ใช้: ${userCPUPercent}% | ระบบ: ${systemCPUPercent}% | รวม: ${totalCPUPercent}% \`\`\``, inline: false },
        { name: "```💻 โหลด CPU (1 นาที)```", value: `\`\`\`${cpuLoad.toFixed(2)}\`\`\``, inline: false }
      )
      .addFields(
        { 
          name: "```🧠 การใช้งานหน่วยความจำ```", 
          value: `\`\`\` หน่วยความจำรวม: ${totalMemoryMB} MB / ${totalMemoryGB} GB \n การใช้งานหน่วยความจำ: ${usedMemoryMB} MB / ${usedMemoryGB} GB (${memoryUsagePercent}%) \`\`\``, 
          inline: false 
        },
        { 
          name: "```⏳ เวลาที่บอทออนไลน์```", 
          value: `\`\`\`${days} วัน ${hours} ชั่วโมง ${minutes} นาที\`\`\``, 
          inline: false 
        },
        { 
          name: "```🌐 จำนวนเซิร์ฟเวอร์ที่บอทอยู่```", 
          value: `\`\`\`${serverCount} เซิร์ฟเวอร์\`\`\``, 
          inline: false 
        }
      )
      .setColor("#00FF00")
      .setTimestamp()
      .setFooter({ text: "ข้อมูล CPU และหน่วยความจำ" });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
