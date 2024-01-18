import { ChatInputCommandInteraction, Interaction } from "discord.js";
import { client, ticketsController, verifyController, workersController } from "../index";
import { evaluateString } from "../func/evaluateString";
import { payoutController } from "../index";
import { checkForPermissions } from "../func/util/checkForPermissions";
export class ChatCommandsController {
    constructor() {}
    async init() {
        console.log("ChatCommandsController:Initialized!");

        client.on("interactionCreate", async (interaction: Interaction) => {
            if (!interaction.isChatInputCommand()) return;
            interaction = interaction as ChatInputCommandInteraction;

            switch (interaction.commandName) {
                case "add-worker": {
                    const permissionsCheck = checkForPermissions(interaction.member!, [], [process.env.CEO_ID!, process.env.MANAGEMENT_ID!, process.env.SUPERVISOR_ID!]);

                    if (!permissionsCheck || typeof permissionsCheck === "string") {
                        await interaction.reply({ content: "Nie masz uprawnień do tej komendy!", ephemeral: true });
                        break;
                    }

                    const user_id = interaction.options.getUser("user")!.id;
                    const nickname_ic = interaction.options.getString("nickname_ic")!;
                    const addWorkerResult = await workersController.addWorker(user_id, nickname_ic);

                    if (addWorkerResult === "WorkersController:addWorker - Worker added") await interaction.reply({ content: "Dodano pracownika!", ephemeral: true });
                    else await interaction.reply({ content: `Wystąpił błąd przy próbie dodania pracownika!\n\`${addWorkerResult}\``, ephemeral: true });

                    break;
                }

                case "register": {
                    const permissionsCheck = checkForPermissions(interaction.member!, [], [process.env.BASE_WORKER_ROLE_ID!]);

                    if (!permissionsCheck || typeof permissionsCheck === "string") {
                        await interaction.reply({ content: "Nie masz uprawnień do tej komendy!", ephemeral: true });
                        break;
                    }

                    const char_name = interaction.options.getString("imie_nazwisko")!;
                    const phone_number = interaction.options.getString("phone")!;
                    const account_number = interaction.options.getString("bank_acc")!;
                    const user_id = interaction.user.id;
                    const registerWorkerResult = await workersController.registerWorker(char_name, phone_number, account_number, user_id);

                    if (registerWorkerResult === "WorkersController:registerWorker - Worker registered") await interaction.reply({ content: "Zarejestrowano!", ephemeral: true });
                    else await interaction.reply({ content: `Wystąpił błąd przy próbie rejestracji!\n\`${registerWorkerResult}\``, ephemeral: true });

                    break;
                }

                case "unregister": {
                    const permissionsCheck = checkForPermissions(interaction.member!, [], [process.env.BASE_WORKER_ROLE_ID!]);

                    if (!permissionsCheck || typeof permissionsCheck === "string") {
                        await interaction.reply({ content: "Nie masz uprawnień do tej komendy!", ephemeral: true });
                        break;
                    }

                    const user_id = interaction.options.getString("user_id")!;
                    const unregisterWorkerResult = await workersController.unregisterWorker(user_id);
                    if (unregisterWorkerResult === "WorkersController:unregisterWorker - Worker unregistered")
                        await interaction.reply({ content: "Usunięto pracownika z bazy!", ephemeral: true });
                    else await interaction.reply({ content: `Wystąpił błąd przy próbie usunięcia pracownika z bazy!\n\`${unregisterWorkerResult}\``, ephemeral: true });
                    break;
                }

                case "evaluate-string": {
                    const evalResult = evaluateString(interaction.user.id, interaction.options.getString("user_input")!);
                    if (evalResult === "evaluateString:no-permission") await interaction.reply({ content: "Nie masz uprawnień do tej komendy!", ephemeral: true });
                    else await interaction.reply({ content: evalResult, ephemeral: true });
                    break;
                }

                case "premia": {
                    const passedNumber = interaction.options.getNumber("kwota")!;
                    const toReturn = interaction.options.getString("zwrot")!;
                    const bonusResult = await payoutController.calculateBonus(interaction.user.id, passedNumber, toReturn);
                    if (bonusResult === "PayoutController:calculateBonus - Payout sent") await interaction.reply({ content: "Premia została wysłana!", ephemeral: true });
                    else await interaction.reply({ content: "Nie udało się wysłać premii!", ephemeral: true });
                    break;
                }

                case "send-panel": {
                    const permissionsCheck = checkForPermissions(interaction.member!, [], [process.env.CEO_ID!]);

                    if (!permissionsCheck || typeof permissionsCheck === "string") {
                        await interaction.reply({ content: "Nie masz uprawnień do tej komendy!", ephemeral: true });
                        break;
                    }

                    const panelResult = await ticketsController.sendTicketPanel(interaction.channel!.id);
                    if (panelResult === "TicketsController:sendTicketPanel - Ticket panel sent") interaction.reply({ content: "Panel został wysłany!", ephemeral: true });
                    else await interaction.reply({ content: "Nie udało się wysłać panelu!", ephemeral: true });
                    break;
                }

                case "send-verify": {
                    const permissionsCheck = checkForPermissions(interaction.member!, [], [process.env.CEO_ID!]);

                    if (!permissionsCheck || typeof permissionsCheck === "string") {
                        await interaction.reply({ content: "Nie masz uprawnień do tej komendy!", ephemeral: true });
                        break;
                    }

                    const sendVerifyResult = await verifyController.sendVerify(interaction.channel!.id);
                    if (sendVerifyResult === "VerifyController:sendVerify - Verify sent") interaction.reply({ content: "Weryfikacja została wysłana!", ephemeral: true });
                    else await interaction.reply({ content: "Nie udało się wysłać weryfikacji!", ephemeral: true });
                    break;
                }
            }
        });
    }
}
