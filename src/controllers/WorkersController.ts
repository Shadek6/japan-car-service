import "dotenv/config";
import { client } from "../index";
import { EmbedBuilder, GuildMember, TextBasedChannel, TextChannel } from "discord.js";
import { databaseController } from "../index";
export class WorkersController {
    public async addWorker(user_id: string, nickname_ic: string) {
        if (user_id === undefined || nickname_ic === null) return "WorkersController:addWorker - Missing arguments";

        const Worker = client.guilds.cache.get(process.env.GUILD_ID!)?.members.cache.get(user_id) as GuildMember;
        if (!Worker) return "WorkersController:addWorker - Worker not found";

        await Worker.roles.add(process.env.BASE_WORKER_RANK_ID!);
        await Worker.roles.add(process.env.BASE_WORKER_ROLE_ID!);
        await Worker.setNickname(`${nickname_ic} | ${Worker.user.username}`);

        const generalChannel = (await client.channels.fetch(process.env.GENERAL_CHANNEL_ID!)) as TextChannel;
        const welcomeEmbed = this.buildWelcomeEmbed(Worker);

        await generalChannel.send({ content: `<@${Worker.id}>`, embeds: [welcomeEmbed] });
        return "WorkersController:addWorker - Worker added";
    }

    public async registerWorker(char_name: string, phone_number: string, account_number: string, user_id: string) 
    {
        const contactChannel = client.channels.cache.get(process.env.CONTACT_CHANNEL_ID!) as TextBasedChannel;
        const fetchedUser = client.guilds.cache.get(process.env.GUILD_ID!)?.members.cache.get(user_id);

        if(!fetchedUser) return "WorkersController:registerWorker - Worker not found";

        if(!phone_number || !account_number || !char_name) return "WorkersController:registerWorker - Missing arguments";
        if(!char_name.includes(" ") || phone_number.length !== 6 || account_number.length !== 10) return "WorkersController:registerWorker - Invalid arguments";
        if(await databaseController.fetchDatabaseData("workers", { user_id: user_id })) return "WorkersController:registerWorker - Worker already exists";


        const WorkerEmbed = new EmbedBuilder()
            .setTitle(fetchedUser.user.username)
            .setThumbnail(fetchedUser.user.displayAvatarURL())
            .addFields({ name: "Character", value: char_name }, { name: "Phone", value: phone_number }, { name: "Bank Account", value: account_number });

        const contactChannelMessage = await contactChannel.send({ embeds: [WorkerEmbed] });

        if(await databaseController.addDatabaseData("workers", { user_id: user_id, char_name: char_name, phone_number: phone_number, account_number: account_number, message_id: contactChannelMessage.id }))
        {
            return "WorkersController:registerWorker - Worker registered";
        }
        else return "WorkersController:registerWorker - Worker not registered";
    }

    public async unregisterWorker(user_id: string) 
    {
        const contactChannel = client.channels.cache.get(process.env.CONTACT_CHANNEL_ID!) as TextBasedChannel;
        const fetchedUser = await databaseController.fetchDatabaseData("workers", { user_id: user_id });

        if(!fetchedUser) return "WorkersController:unregisterWorker - Worker not found";

        contactChannel.messages.delete(fetchedUser.message_id);
        if(await databaseController.deleteDatabaseData("workers", { user_id: user_id })) return "WorkersController:unregisterWorker - Worker unregistered";
        else return "WorkersController:unregisterWorker - Worker not unregistered";
    }
    private buildWelcomeEmbed(Worker: GuildMember) {
        const Welcome_Embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle("Witaj w ekipie!")
            .setDescription(
                `Hejeczka <@${Worker.id}> witamy w naszym zespole, mamy nadzieje że będziesz się tutaj świetnie bawić oraz się odnajdziesz w naszym środowisku, na samym początku zapoznaj się ze wszystkimi naszymi kanałami, najlepiej wszystkimi, poniżej zaś masz obowiązkowe kanały, aby móc się odnaleźć na naszym discordzie oraz na serwerze jako mechanik bez problemu, życzymy miłej pracy! :heart:`
            )
            .setThumbnail(`${Worker.user.avatarURL()}?size=4096`)
            .addFields(
                { name: "Kontakt", value: `<#${process.env.CONTACT_CHANNEL_ID as string}>`, inline: false },
                { name: "Premia", value: `<#${process.env.BONUS_CHANNEL_ID as string}>`, inline: true },
                { name: "Wiedza", value: `<#${process.env.KNOWLEDGE_CHANNEL_ID as string}>`, inline: false },
                { name: "Komendy", value: `<#${process.env.COMMANDS_CHANNEL_ID as string}>`, inline: true }
            )
            .setTimestamp();

        return Welcome_Embed;
    }
}
