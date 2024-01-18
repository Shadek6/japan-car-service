import { ActionRowBuilder, ButtonBuilder, CategoryChannel, ChannelType, EmbedBuilder, Guild, GuildChannel, GuildMember, Message, OverwriteResolvable, TextBasedChannel } from "discord.js";
import { client } from "..";
import { TicketType } from "../types/TicketType";
import { createButton } from "../func/util/createButton";

export class TicketsController {
    constructor() {}

    public async sendTicketPanel(channel_id: string) {
        const clientGuild = client.guilds.cache.get(process.env.GUILD_ID!);
        if (!clientGuild) return "TicketsController:sendTicketPanel - Guild not found";

        const ticketChannel = clientGuild.channels.cache.get(channel_id) as TextBasedChannel;
        if (!ticketChannel) return "TicketsController:sendTicketPanel - Channel not found";

        const TicketPanelEmbed = new EmbedBuilder().setTitle("Panel ticketów").setDescription("Wybierz którąś z poniższych opcji w celu założenia ticketa.").setColor("Random");

        const TuningButton = createButton("PRIMARY", TicketType.Tuning.toLowerCase(), TicketType.Tuning, "🏁");
        const WorkButton = createButton("PRIMARY", TicketType.Work.toLowerCase(), TicketType.Work, "📝");
        const PartnerButton = createButton("PRIMARY", TicketType.Partnership.toLowerCase(), TicketType.Partnership, "🤝");

        const ActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(TuningButton, WorkButton, PartnerButton);

        if (await ticketChannel.send({ embeds: [TicketPanelEmbed], components: [ActionRow] })) {
            return "TicketsController:sendTicketPanel - Ticket panel sent";
        }
    }
    public async createTicket(user_id: string, ticketType: TicketType, accessRoles: string[]) {
        const clientGuild = client.guilds.cache.get(process.env.GUILD_ID!)!;
        const ticketCategory = process.env.TICKET_CATEGORY;
        const ticketAuthor = clientGuild ? clientGuild.members.cache.get(user_id) : null;

        if (!ticketCategory) return "TicketsController:createTicket - Ticket category not found";
        if (!ticketAuthor) return "TicketsController:createTicket - Ticket author not found";

        const TicketChannel = await this.createTicketChannelWithAccessOverwrites(clientGuild!, ticketType, ticketAuthor!, clientGuild.channels.cache.get(ticketCategory) as CategoryChannel, accessRoles, user_id);

        if (!TicketChannel) return "TicketsController:createTicket - Ticket channel not created";

        const ActionRow = new ActionRowBuilder<ButtonBuilder>();
        const CloseButton = createButton("DANGER", `close-ticket`, "Zamknij Ticket", "🔒");
        ActionRow.addComponents(CloseButton);

        if (await TicketChannel.send({ embeds: [this.buildTicketEmbed(ticketType, ticketAuthor)], content: `<@!${user_id}>`, components: [ActionRow] })) {
            return "TicketsController:createTicket - Ticket sent";
        } else {
            return "TicketsController:createTicket - Ticket not sent";
        }
    }

    private async createTicketChannelWithAccessOverwrites(clientGuild: Guild, ticketType: TicketType, ticketAuthor: GuildMember, ticketCategory: CategoryChannel, accessRoles: string[], user_id: string) {
        const accessOverwrites: OverwriteResolvable[] = [];
        accessRoles.forEach((role) => {
            const clientRole = clientGuild?.roles.cache.get(role);
            accessOverwrites.push({
                id: clientRole!,
                allow: ["ViewChannel"],
            });
        });
    
        return await clientGuild?.channels.create({
            name: `${ticketType}-${ticketAuthor.user.username}`,
            type: ChannelType.GuildText,
            parent: ticketCategory,
            permissionOverwrites: [
                ...accessOverwrites,
                {
                    id: user_id,
                    allow: ["ViewChannel"],
                },
                {
                    id: clientGuild.id,
                    deny: ["ViewChannel"],
                },
            ],
        });
    }

    private buildTicketEmbed(ticketType: TicketType, ticketAuthor: GuildMember) {
        const TicketEmbed = new EmbedBuilder()
            .setTitle(`${ticketType} ${ticketAuthor.user.username}`)
            .setColor("Random")
            .setTimestamp()
            .setThumbnail(process.env.EXOTIC_LOGO as string)
            .setAuthor({ name: ticketAuthor.user.username });

        if (ticketType === TicketType.Work) {
            TicketEmbed.setDescription(
                "Witaj w tickecie, który rozpoczyna Twój proces rekrutacji! Umów się z którymś z naszych rekruterów w grze, aby dołączyć do naszego zespołu."
            );
        }

        if (ticketType === TicketType.Tuning) {
            TicketEmbed.setAuthor({ name: "Zlecenie Tuningu" });
            TicketEmbed.setTitle("**Wzór formularza tuningowego**");
            TicketEmbed.setDescription("```Imię i nazwisko właściciela:\nPojazd:\nTuning:\nNumer telefonu:```");
            TicketEmbed.setColor("Random");
            TicketEmbed.setThumbnail(process.env.EXOTIC_LOGO as string);
            TicketEmbed.setTimestamp();
        }

        return TicketEmbed;
    }

    public async closeTicket(user_id: string, channel_id: string) 
    {
        const fetchedUser = client.guilds.cache.get(process.env.GUILD_ID!)?.members.cache.get(user_id) as GuildMember;
        const fetchedChannel = client.channels.cache.get(channel_id) as GuildChannel;

        ((fetchedChannel) as TextBasedChannel).send({ content: "Ticket zostanie zamknięty za klika sekund..." })
        .then((msg: Message) => {
            setTimeout(() => {
                fetchedChannel.setParent(process.env.CLOSED_TICKET_CATEGORY!);
                fetchedChannel.permissionOverwrites.delete(process.env.BASE_WORKER_ROLE_ID!)
                fetchedChannel.permissionOverwrites.set( [{ id: fetchedUser.guild.id, deny: ["ViewChannel"] }])
                msg.delete()
            }, 5000);
        })
    }
}
