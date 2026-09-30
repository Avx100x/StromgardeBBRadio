require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus, 
    VoiceConnectionStatus,
    StreamType
} = require('@discordjs/voice');

// OctoWoW AzuraCast Direct Radio Stream URL
const RADIO_STREAM_URL = 'https://radio.octowow.st/listen/booty_bay_pirate_radio/radio.mp3';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once('ready', () => {
    console.log(`[Radio Bot] Logged in as ${client.user.tag}!`);
    connectAndPlay();
});

function connectAndPlay() {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) {
        console.error("Guild not found! Check your GUILD_ID in .env");
        return;
    }

    // Connect to Voice Channel
    const connection = joinVoiceChannel({
        channelId: process.env.VOICE_CHANNEL_ID,
        guildId: process.env.GUILD_ID,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: true
    });

    const player = createAudioPlayer();

    function playStream() {
        console.log('[Radio Bot] Connecting to Booty Bay Pirate Radio stream...');
        const resource = createAudioResource(RADIO_STREAM_URL, {
            inputType: StreamType.Arbitrary
        });
        player.play(resource);
    }

    connection.subscribe(player);
    playStream();

    // Auto-reconnect on stream end or error (24/7 behavior)
    player.on(AudioPlayerStatus.Idle, () => {
        console.log('[Radio Bot] Stream disconnected. Reconnecting in 5 seconds...');
        setTimeout(playStream, 5000);
    });

    player.on('error', (error) => {
        console.error('[Radio Bot Error]:', error.message);
        setTimeout(playStream, 5000);
    });

    connection.on(VoiceConnectionStatus.Disconnected, () => {
        console.log('[Radio Bot] Voice connection lost. Reconnecting...');
        setTimeout(connectAndPlay, 5000);
    });
}

client.login(process.env.DISCORD_TOKEN);