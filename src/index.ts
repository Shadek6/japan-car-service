import 'dotenv/config'
import { Client, GatewayIntentBits } from "discord.js";
import { DatabaseController } from "./controllers/DatabaseController";
import { WorkersController } from './controllers/WorkersController';
import { ChatCommandsController } from './controllers/ChatCommandsController';
import { PayoutController } from './controllers/PayoutController';
import { ButtonsController } from './controllers/ButtonsController';
import { TicketsController } from './controllers/TicketsController';
import { VerifyController } from './controllers/VerifyController';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildBans, GatewayIntentBits.MessageContent],
});

const databaseController = new DatabaseController(process.env.MONGO_URI!, "japan-car-service");
const workersController = new WorkersController();
const chatCommandsController = new ChatCommandsController();
const payoutController = new PayoutController();
const buttonsController = new ButtonsController();
const ticketsController = new TicketsController();
const verifyController = new VerifyController();

client.on("ready", () => {
    console.log("Bot is ready!");
    chatCommandsController.init();
    buttonsController.init();
});

export { client, databaseController, workersController, payoutController, ticketsController, verifyController }
client.login(process.env.TOKEN);