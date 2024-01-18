const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("register")
        .setDescription("Zarejestruj się jako pracownik warsztatu.")
        .addStringOption((option) =>
            option
                .setName("imie_nazwisko")
                .setDescription(
                    "Imię i nazwisko Twojej postaci. Format: Kaylan Reeves"
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("phone")
                .setDescription("Numer telefonu Twojej postaci. Format: 000111")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("bank_acc")
                .setDescription(
                    "Numer konta bankowego Twojej postaci. Format: 0000000000 (10 Cyfr)"
                )
                .setRequired(true)
        ),
};
