require('dotenv').config();

const { Client, Intents } = require('discord.js-commands')(require('discord.js'));
const music = require('./index')(require('discord.js'));
const client = new Client({
    token: process.env.DISCORD_TOKEN,
    publicKey: process.env.DISCORD_PUBLIC_KEY,
    intents: Intents.ALL,
    handlers: music.handlers
});

client.on('log', (string, object) => { console.log(string, object || '') });
client.login();
