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

const ID_GROUP_SALA_DEV = process.env.ID_GROUP_SALA_DEV!;

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
const telegramClient = new TelegramClient(TELEGRAM_BOT_TOKEN);

const stickers = [
    'CAACAgEAAxkBAAMZZ9zC2Hzh_uP7G-h4jyVwmhNGOUIAAnADAAK7F2lHdV8KmrJfF8A2BA',
    'CAACAgEAAxkBAAMXZ9zC1x_i2wEK84pegbcoIbJTKY0AAu4DAALRJ9FHJLXtz1sEVZQ2BA',
    'CAACAgEAAxkBAAMUZ9zCE2sAAcijjuHE8y9QEK4f-wpxAAJuAgACyedwRa-gDTgWH92fNgQ',
    'CAACAgEAAxkBAAMeZ9zC-LPQJWnWIrmSScsURindMJYAAusCAAJwhhhF8HTB6mM2Tjw2BA',
    'CAACAgEAAxkBAANJZ9zEuFEsBtq9MteDwvM5PpoZxFYAAgIEAAJ8u8hGHaNpKdR6_IE2BA'
]


discordClient.on(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
});

telegramClient.on('ready', ({ user }) => {
    console.log(`Bot ready as ${user?.username}`);
});

discordClient.on('voiceStateUpdate', async (oldState, newState) => {

    if (oldState.channel === null && newState.channel !== null) {
        if (newState.channel.parentId !== ID_GROUP_SALA_DEV) return

        const invite = await createInvite(newState.guild.id, newState.channel.id)

        if (FELPS_DISCORD_ID === newState?.member?.user.username) {
            console.log(`Sending message to ${RPD_DISCORD_ID}`)

            send(RPD_TELEGRAM_CHAT_ID, invite)
        }

        if (RPD_DISCORD_ID === newState?.member?.user.username) {
            console.log(`Sending message to ${FELPS_DISCORD_ID}`)

            send(FELPS_TELEGRAM_CHAT_ID, invite)
        }
    }
});

async function createInvite(guildId: string, channelId: string) {
    console.log('Creating invite...')
    const guild = discordClient.guilds.cache.get(guildId);

    if (!guild) {
        console.error('Guild not found.');
        return;
    }

    const channel = guild.channels.cache.get(channelId);

    if (!channel) {
        console.error('Channel not found.');
        return;
    }

    try {
        return (await channel.guild.invites.create(channelId)).url
    } catch (error) {
        console.error('Error creating invite:', error);
    }

}

async function send(id: string, invite?: string) {
    console.log('Sending message...')
    try {

        await telegramClient.sendMessage({
            chatId: id,
            text: `Mai num? \n ${invite}`,
            linkPreviewOptions: {
                is_disabled: true
            },

        })
        await telegramClient.sendSticker({
            chatId: id,
            sticker: stickers[Math.floor(Math.random() * stickers.length)]
        })

    } catch (error) {
        console.log(error)
    }

}



function main() {
    console.log('Starting bot...')
    telegramClient.login();
    discordClient.login(DISCORD_TOKEN);
}

main()