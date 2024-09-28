const {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    InteractionType,
    PermissionsBitField,
} = require("discord.js");
const Verify = require("../database/schemas/verifySchema");

// ฟังก์ชันสร้างโค้ดยืนยันตัวตน 6 หลัก
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setverify")
        .setDescription("ตั้งค่าระบบยืนยันตัวตน")
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("ช่องที่ใช้สำหรับยืนยันตัวตน")
                .setRequired(true),
        )
        .addRoleOption((option) =>
            option
                .setName("role")
                .setDescription("บทบาทที่จะมอบให้เมื่อยืนยันตัวตนสำเร็จ")
                .setRequired(true),
        ),
    async execute(interaction) {
        // ตรวจสอบว่าผู้ใช้มีสิทธิ์เป็นผู้ดูแลระบบหรือไม่
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "คุณต้องมีสิทธิ์ผู้ดูแลระบบเพื่อใช้คำสั่งนี้",
                ephemeral: true,
            });
        }

        const channel = interaction.options.getChannel("channel");
        const role = interaction.options.getRole("role");

        console.log(
            `กำลังตั้งค่าระบบยืนยันตัวตนสำหรับช่อง ${channel.id} และบทบาท ${role.id}`,
        );

        try {
            await Verify.findOneAndUpdate(
                { guildId: interaction.guild.id },
                {
                    $set: {
                        code: "SETUP",
                        channelId: channel.id,
                        roleId: role.id,
                    },
                },
                { upsert: true },
            );

            const embed = new EmbedBuilder()
                .setTitle("ระบบยืนยันตัวตน")
                .setDescription("คลิกปุ่มด้านล่างเพื่อเริ่มการยืนยันตัวตน")
                .setColor("#7289DA")
                .setImage(
                    "https://media.giphy.com/media/your-gif-url-here/giphy.gif",
                );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("start_verify")
                    .setLabel("เริ่มการยืนยันตัวตน")
                    .setStyle(ButtonStyle.Success),
            );

            await interaction.reply({
                content: `ระบบยืนยันตัวตนได้ถูกตั้งค่าในช่อง ${channel} พร้อมบทบาท ${role}.`,
                ephemeral: true,
            });

            try {
                await channel.send({ embeds: [embed], components: [row] });
            } catch (sendError) {
                console.error("เกิดข้อผิดพลาดในการส่งข้อความยืนยันตัวตน:", sendError);
                await interaction.followUp({
                    content: "เกิดข้อผิดพลาดในการส่งข้อความยืนยันตัวตน",
                    ephemeral: true,
                });
            }
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการบันทึกการตั้งค่ายืนยันตัวตน:", error);
            await interaction.reply({
                content: "เกิดข้อผิดพลาดในการตั้งค่าระบบยืนยันตัวตน",
                ephemeral: true,
            });
        }
    },

    async handleButtonInteraction(interaction) {
        try {
            if (interaction.customId === "start_verify") {
                await this.handleStartVerify(interaction);
            } else if (interaction.customId === "input_code") {
                await this.handleInputCode(interaction);
            }
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการจัดการปฏิสัมพันธ์ปุ่ม:", error);
            await interaction.reply({
                content: "เกิดข้อผิดพลาดในการจัดการปฏิสัมพันธ์ปุ่ม",
                ephemeral: true,
            });
        }
    },

    async handleStartVerify(interaction) {
        try {
            const verifyData = await Verify.findOne({
                guildId: interaction.guild.id,
            });

            if (!verifyData) {
                throw new Error("ไม่พบข้อมูลยืนยันตัวตน.");
            }

            const newCode = generateVerificationCode();

            await Verify.findOneAndUpdate(
                { guildId: interaction.guild.id },
                {
                    $set: {
                        code: newCode,
                    },
                },
            );

            const modal = new ModalBuilder()
                .setCustomId("verification_modal")
                .setTitle("ยืนยันตัวตน");

            const codeInput = new TextInputBuilder()
                .setCustomId("verification_code")
                .setLabel(`กรุณาใส่รหัสยืนยัน: ${newCode}`)
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("ใส่รหัสที่นี่")
                .setRequired(true);

            const actionRow = new ActionRowBuilder().addComponents(codeInput);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการเริ่มการยืนยันตัวตน:", error);
            await interaction.reply({
                content: "เกิดข้อผิดพลาดในการเริ่มการยืนยันตัวตน",
                ephemeral: true,
            });
        }
    },

    async handleInputCode(interaction) {
        if (interaction.type !== InteractionType.ModalSubmit) return;

        try {
            const submittedCode =
                interaction.fields.getTextInputValue("verification_code");
            const verifyData = await Verify.findOne({
                guildId: interaction.guild.id,
            });

            if (!verifyData) {
                throw new Error("ไม่พบข้อมูลยืนยันตัวตน.");
            }

            if (submittedCode === verifyData.code) {
                const role = interaction.guild.roles.cache.get(
                    verifyData.roleId,
                );
                if (role) {
                    const member = await interaction.guild.members.fetch(
                        interaction.user.id,
                    );
                    await member.roles.add(role);
                    await interaction.reply({
                        content: "ยืนยันตัวตนสำเร็จ!",
                        ephemeral: true,
                    });
                } else {
                    await interaction.reply({
                        content: "ไม่พบบทบาท!",
                        ephemeral: true,
                    });
                }
            } else {
                await interaction.reply({
                    content: "โค้ดไม่ถูกต้อง กรุณาลองอีกครั้ง.",
                    ephemeral: true,
                });
            }
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการตรวจสอบโค้ด:", error);
            await interaction.reply({
                content: "เกิดข้อผิดพลาดในการตรวจสอบโค้ด",
                ephemeral: true,
            });
        }
    },
};
