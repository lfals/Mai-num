import { Effect, Config, Layer, Console } from "effect"
import * as Dotenv from 'dotenv'
import { Client, Events, GatewayIntentBits } from 'discord.js'
import { TelegramClient } from "telegramsjs";

Dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

const FELPS_DISCORD_ID = process.env.FELPS_DISCORD_ID!;
const RPD_DISCORD_ID = process.env.RPD_DISCORD_ID!;

const RPD_TELEGRAM_CHAT_ID = process.env.RPD_TELEGRAM_CHAT_ID!;
const FELPS_TELEGRAM_CHAT_ID = process.env.FELPS_TELEGRAM_CHAT_ID!;

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
const telegramClient = new TelegramClient(TELEGRAM_BOT_TOKEN);


discordClient.on(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
});

telegramClient.on('ready', ({ user }) => {
    console.log('Bot ready')
});

discordClient.on('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.channel === null && newState.channel !== null) {
        if (FELPS_DISCORD_ID === newState?.member?.user.username) {
            send(RPD_TELEGRAM_CHAT_ID)
        }

        if (RPD_DISCORD_ID === newState?.member?.user.username) {
            send(FELPS_TELEGRAM_CHAT_ID)
        }
    }
});

async function send(id: string) {

    telegramClient.sendMessage({
        chatId: id,
        text: "Mai num?",
    }).then(() => {
        console.log('Message sent')
    }
    ).catch((err) => {
        console.log(err)
    }
    )
}

const main = Effect.gen(function* () {
    telegramClient.login();
    discordClient.login(DISCORD_TOKEN);
})


Effect.runFork(main)