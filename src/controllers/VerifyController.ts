import { GuildMember, TextBasedChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";
import { client } from "..";
import { createButton } from "../func/util/createButton";

export class VerifyController {
    public async sendVerify(channel_id: string) {
        const fetchedChannel = client.channels.cache.get(channel_id) as TextBasedChannel;

        const verifyEmbed = new EmbedBuilder()
            .setTitle("Weryfikacja")
            .setDescription("Aby otrzymać dostęp do serwera, musisz przejść weryfikację. W tym celu, wciśnij poniższy przycisk.")
            .setColor("Random")
            .setTimestamp()
            .setImage(process.env.EXOTIC_LOGO as string);

        const VERIFY_BUTTON = createButton("PRIMARY", "verify", "Weryfikuj", "🔒");
        const BUTTONS_ROW = new ActionRowBuilder<ButtonBuilder>().addComponents(VERIFY_BUTTON);

        if (await fetchedChannel?.send({ embeds: [verifyEmbed], components: [BUTTONS_ROW] })) return "VerifyController:sendVerify - Verify sent";
        else return "TicketsController:sendVerify - Verify not sent";
    }

    public async grantAccess(user_id: string) {
        const fetchedUser = client.guilds.cache.get(process.env.GUILD_ID!)?.members.cache.get(user_id) as GuildMember;
        if (!fetchedUser) return "VerifyController:grantAccess - User not found";

        if (await fetchedUser.roles.add(process.env.VERIFIED_ROLE_ID!)) return "VerifyController:grantAccess - Access granted";
        else return "VerifyController:grantAccess - Access not granted";
    }
}
