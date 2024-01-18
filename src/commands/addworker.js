const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("add-worker")
        .setDescription("Nadaje dostępy do wyznaczonych kanałów.")
        .addMentionableOption((option) => 
        option.setName("user")
        .setDescription("Użytkownik, któremu chcesz nadać dostęp do kanałów.")
        .setRequired(true))
        .addStringOption((option) => 
        option.setName("nickname_ic")
        .setDescription("Nick IC użytkownika.")
        .setRequired(true))
};
