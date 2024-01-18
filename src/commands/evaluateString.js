const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("evaluate-string")
        .setDescription("Evaluate string.")
        .addStringOption((option) =>
            option
                .setName("user_input")
                .setDescription(
                    "User input."
                )
                .setRequired(true)
        )
};
