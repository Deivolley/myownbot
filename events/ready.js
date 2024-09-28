module.exports = (client) => {
  console.log(`Logged in as ${client.user.tag}`);
  bot.on("ready", () => {
    // Set the bot's activity
    bot.user.setActivity("/help เพื่อเรียนรู้คำสั่ง", { type: "PLAYING" });

    console.log(`Logged in as ${bot.user.tag}!`);
  });
};
