const { Command } = require('discord.js');

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            allowDM: false,
            json: {
                name: 'join',
                description: 'Join a voice channel',
                options: [{
                    type: 'CHANNEL',
                    name: 'channel',
                    required: false,
                    description: 'Join a specific channel'
                }]
            },
            responses: {
                200: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! I have successfully joined ${options.vc} 😷` }),
                400: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! You aren't in any voice channels 🤭` }),
                415: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! ${options.vc} is not a voice channel... 😶` }),
                405: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! ${options.vc} is not a voice channel I can join 😤` })
            }
        });
    }

    execute(interaction) {
        const { client, channel, member } = interaction;
        return interaction.acknowledge({ hideSource: true }).then(() => {
            const channelID = interaction.options?. [0].value;
            if (channelID) {
                return client.channels.fetch(channelID).then(voiceChannel => {
                    if (voiceChannel.type !== 'voice') return channel.send(this.responses[415](interaction, { vc: voiceChannel }));
                    if (!voiceChannel.joinable) return channel.send(this.responses[405](interaction, { vc: voiceChannel }));
                    return Promise.resolve(voiceChannel.join()).then(channel.send(this.responses[200](interaction, { vc: voiceChannel })));
                });
            } else {
                const voiceChannel = member.voice.channel;
                if (!voiceChannel) return channel.send(this.responses[400](interaction));
                if (!voiceChannel.joinable) return channel.send(this.responses[405](interaction, { vc: voiceChannel }));
                return Promise.resolve(voiceChannel.join()).then(channel.send(this.responses[200](interaction, { vc: voiceChannel })));
            }
        });
    }
}
