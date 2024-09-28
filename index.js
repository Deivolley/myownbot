require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  InteractionType,
  ActivityType,
  PermissionsBitField,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const mongoose = require("./database/connection");

// สร้างอินสแตนซ์ของ Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
  presence: {
    activities: [
      { name: "/help 🔹เพื่อเรียนรู้คำสั่งของหนู", type: ActivityType.Playing },
    ],
    status: "idle",
  },
});

// การจัดการคำสั่ง
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// ลงทะเบียนคำสั่งทั่วโลก
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      // ตรวจสอบสิทธิ์ผู้ใช้สำหรับคำสั่ง 'setup'
      if (
        command.data.name === "setup" &&
        !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
      ) {
        return interaction.reply({
          content: "คุณต้องเป็นผู้ดูแลระบบจึงจะสามารถใช้คำสั่งนี้ได้!",
          ephemeral: true,
        });
      }

      await command.execute(interaction);
    } else if (interaction.isButton()) {
      const command = client.commands.get("setverify");
      if (!command) return;

      await command.handleButtonInteraction(interaction);
    } else if (interaction.type === InteractionType.ModalSubmit) {
      const command = client.commands.get("setverify");
      if (!command) return;

      await command.handleInputCode(interaction);
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการจัดการ interaction:", error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "เกิดข้อผิดพลาดในการประมวลผลการโต้ตอบนี้.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "เกิดข้อผิดพลาดในการประมวลผลการโต้ตอบนี้.",
        ephemeral: true,
      });
    }
  }
});

// ลงทะเบียนคำสั่ง
(async () => {
  try {
    console.log("เริ่มการรีเฟรชคำสั่ง (/) สำหรับแอปพลิเคชันแล้ว");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: Array.from(client.commands.values()).map((command) =>
        command.data.toJSON()
      ),
    });

    console.log("รีเฟรชคำสั่ง (/) สำหรับแอปพลิเคชันเรียบร้อยแล้ว");
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลงทะเบียนคำสั่ง:", error);
  }
})();

// การจัดการอีเวนต์
client.once("ready", () => {
  console.log(`เข้าสู่ระบบในชื่อ ${client.user.tag}!`);
});

// นำเข้า event handlers
const guildMemberAdd = require("./events/guildMemberAdd");
const guildMemberRemove = require("./events/guildMemberRemove");
const guildMemberUpdate = require("./events/guildMemberUpdate");

client.on("guildMemberAdd", (member) => guildMemberAdd.execute(member));
client.on("guildMemberRemove", (member) => guildMemberRemove.execute(member));
client.on("guildMemberUpdate", (oldMember, newMember) =>
  guildMemberUpdate.execute(oldMember, newMember)
);

// จัดการเมื่อบอทออกจากเซิร์ฟเวอร์
client.on("guildDelete", async (guild) => {
  console.log(`บอทถูกลบออกจากเซิร์ฟเวอร์: ${guild.name} (${guild.id})`);

  try {
    const schemas = [
      "./database/schemas/welcomeSchema",
      "./database/schemas/goodbyeSchema",
      "./database/schemas/verifySchema",
      "./database/schemas/boosterNotificationSchema",
    ];

    // ลบข้อมูลที่เกี่ยวข้องกับเซิร์ฟเวอร์
    for (const schemaPath of schemas) {
      const schema = require(schemaPath);
      await schema.deleteMany({ guildId: guild.id });
    }

    console.log(
      `ลบข้อมูลทั้งหมดที่เกี่ยวข้องกับเซิร์ฟเวอร์: ${guild.id} เรียบร้อยแล้ว`
    );
  } catch (error) {
    console.error(`เกิดข้อผิดพลาดในการลบข้อมูลของเซิร์ฟเวอร์ ${guild.id}:`, error);
  }
});

// เข้าสู่ระบบ Discord
client.login(process.env.TOKEN);

module.exports = client;
