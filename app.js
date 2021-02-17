require('dotenv').config();

const Discord = require('discord.js-commands')(require('discord.js'));
Discord.Guild = require('./lib/AudioGuild')(Discord);

const client = new Discord.Client({
    token: process.env.DiscordToken,
    publicKey: process.env.DiscordPublicKey
});

client.once('ready', () => {
    client.registerCommand([
        new(require('./src/commands/join'))(client),
        new(require('./src/commands/leave'))(client),
        new(require('./src/commands/queue'))(client),
        new(require('./src/commands/skip'))(client),
        new(require('./src/commands/next'))(client),
    ], false);
});

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));
client.login(process.env.DiscordToken);
