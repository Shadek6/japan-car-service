import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, GuildMember, GuildTextBasedChannel, Message } from "discord.js";
import { client, databaseController } from "../index";
import { PayoutProps } from "../types/PayoutProps";
import { createButton } from "../func/util/createButton";
export class PayoutController {
    private BonusRoles: string[];
    private BonusPercentage: number[];

    constructor() {
        this.BonusRoles = [process.env.ROOKIE_ID!, process.env.WORKER_ID!, process.env.PROFESSIONAL_ID!, process.env.SUPERVISOR_ID!, process.env.MANAGEMENT_ID!, process.env.CEO_ID!];
        this.BonusPercentage = [0.45, 0.5, 0.55, 0.6, 0.65, 1];
    }

    public async calculateBonus(user_id: string, passedNumber: number, toReturn: string) {
        const fetchedWorker = await databaseController.fetchDatabaseData("workers", { user_id: user_id }) as PayoutProps;
        const guildMember = await client.guilds.cache.get(process.env.GUILD_ID!)?.members.cache.get(user_id);

        if (!guildMember?.roles.cache.some((r) => r.id === process.env.BASE_WORKER_ROLE_ID)) return "PayoutController:calculateBonus - User is not a worker";

        if (!fetchedWorker) return "PayoutController:calculateBonus - Worker not found";
        if (!guildMember) return "PayoutController:calculateBonus - GuildMember not found";

        const userData: PayoutProps = {
            bonus_percentage: 0.5,
            user_id: fetchedWorker.user_id,
            char_name: fetchedWorker.char_name,
            account_number: fetchedWorker.account_number,
            phone_number: fetchedWorker.phone_number,
            message_id: fetchedWorker.message_id
        };

        const memberRoles = guildMember.roles.cache;
        this.BonusRoles.forEach((role, index) => {
            if (memberRoles.some((r) => r.id === role)) {
                userData.bonus_percentage = this.BonusPercentage[index];
            }
        });

        const bonusEmbed = this.buildBonusEmbed(userData, guildMember, passedNumber, toReturn);
        const bonusChannel = client.channels.cache.get(process.env.BONUS_CHANNEL_ID!) as GuildTextBasedChannel;

        const bonusButton = createButton("PRIMARY", "payout-bonus", "Wypłać", "<:ilo_procent:1180622707700805783>");
        const ActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(bonusButton);

        if (await bonusChannel.send({ embeds: [bonusEmbed], components: [ActionRow] })) {
            return "PayoutController:calculateBonus - Payout sent";
        }
    }

    private buildBonusEmbed(userData: PayoutProps, guildMember: GuildMember, passedNumber: number, toReturn: string) {
        toReturn === "true" ? (toReturn = "TAK") && (userData.bonus_percentage = 1) : (toReturn = "NIE");

        const bonusEmbed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(`Premia - ${(userData.bonus_percentage * 100).toFixed(0)}%`)
            .setAuthor({ name: `${guildMember?.nickname}`, iconURL: `${guildMember.displayAvatarURL()}` })
            .addFields({ name: "Imię i nazwisko", value: `${userData.char_name}`, inline: true })
            .addFields({ name: "Data", value: `${new Date(Date.now()).toLocaleDateString("pl-PL")} ${new Date().getUTCHours() + 1}:${new Date().getUTCMinutes()}`, inline: true })
            .addFields({ name: "Robocizna", value: `$${passedNumber}`, inline: true })
            .addFields({ name: "Premia", value: `$${(passedNumber * userData.bonus_percentage).toFixed(0)}`, inline: true })
            .addFields({ name: "Numer konta", value: `${userData.account_number}`, inline: true })
            .addFields({ name: "Zwrot", value: `${toReturn}`, inline: true })
            .addFields({ name: "Status", value: ":negative_squared_cross_mark:", inline: false })
            .addFields({ name: "Wypłacone przez", value: "-", inline: true });

        return bonusEmbed;
    }

    public async updateBonusStatus(user_id: string, buttonMessage: Message) {
        const interactionUser = client.guilds.cache.get(process.env.GUILD_ID!)?.members.cache.get(user_id) as GuildMember;
        const newEmbed = buttonMessage.embeds[0];

        if (newEmbed.fields[6].value !== ":negative_squared_cross_mark:") {
            return "PayoutController:updateBonusStatus - Bonus already paid";
        }

        newEmbed.fields[6].value = ":white_check_mark:";
        newEmbed.fields[7].value = `**${interactionUser.nickname ?? interactionUser.user.username}**`;

        const embedAuthor = interactionUser.guild.members.cache.find((u) => u.nickname === newEmbed.author?.name);
        const authorAvatar = newEmbed.author?.iconURL;
        
        const thanksEmbed = new EmbedBuilder()
            .setColor("Random")
            .setAuthor({ name: `${embedAuthor?.nickname}`, iconURL: authorAvatar })
            .setTitle("Premia Wypłacona")
            .setDescription(`Twoja premia w wysokości \`${newEmbed.fields[3].value}\` została przekazana na Twoje konto! Dziękujemy za pracę w **Exotic Workshop**!`)
            .setImage(process.env.EXOTIC_LOGO as string);

        const userDM = await embedAuthor?.createDM(true);
        await userDM?.send({ embeds: [thanksEmbed] });

        await buttonMessage.edit({ embeds: [newEmbed] });
        return "PayoutController:updateBonusStatus - Bonus paid";
    }
}
