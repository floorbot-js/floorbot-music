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


// const AudioTrack = require('./lib/AudioTrack');
// AudioTrack.generate('https://www.youtube.com/playlist?list=PLVtIFuYG6eXzQjrFaD-IfMSE0uTFDIgJ-').then(console.log) // YT Playlist
// AudioTrack.generate('https://www.youtube.com/watch?v=SLNsPqIdiGk').then(console.log) // YT Song
// AudioTrack.generate('https://soundcloud.com/MauiOfficial69/likes').then(console.log) // Ben playlist
// AudioTrack.generate('https://www.twitch.tv/japan_asmr').then(console.log) // Twtich stream LIVE
// AudioTrack.generate('https://www.twitch.tv/arcadeena').then(console.log).catch(console.log) // Twtich stream NOT LIVE


/**


https://www.youtube.com/watch?v=SLNsPqIdiGk

TUTURU:

https://www.youtube.com/watch?v=HkGNeN0LGOE

**/
