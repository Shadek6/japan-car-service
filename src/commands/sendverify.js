const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("send-verify")
        .setDescription("Wysyła panel weryfikacyjny na obecnym kanale."),
};
