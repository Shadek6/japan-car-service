const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("send-panel")
        .setDescription("Wysyła panel ticketów na obecnym kanale."),
};
