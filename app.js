require('dotenv').config();

const Discord = require('discord.js-commands')(require('discord.js'));

const client = new Discord.Client({
    token: process.env.DiscordToken,
    publicKey: process.env.DiscordPublicKey
});

client.once('ready', () => {
    client.registerCommand([
        new(require('./src/commands/join'))(client),
        new(require('./src/commands/leave'))(client),
    ], false);
});

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));
client.login(process.env.DiscordToken);
