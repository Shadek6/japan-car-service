const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unregister")
        .setDescription("Usunięcie danych pracownika z bazy pracowników.")
        .addStringOption((option) =>
            option.setName("user_id").setDescription("Discord ID pracownika, który ma zostać wyrzucony z bazy.").setRequired(true)
        ),
};
