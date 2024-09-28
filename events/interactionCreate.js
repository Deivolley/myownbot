client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการเรียกใช้คำสั่ง:", error);
            await interaction.reply({
                content: "เกิดข้อผิดพลาดขณะเรียกใช้คำสั่งนี้!",
                ephemeral: true,
            });
        }
    } else if (interaction.isButton()) {
        const command = client.commands.get("setverify"); // ตรวจสอบให้แน่ใจว่า 'setverify' ได้ถูกลงทะเบียน
        if (!command) return;

        await command.handleButtonInteraction(interaction);
    } else if (interaction.isModalSubmit()) {
        const command = client.commands.get("setverify");
        if (!command) return;

        await command.handleInputCode(interaction); // เรียกใช้ฟังก์ชัน handleInputCode
    }
});
