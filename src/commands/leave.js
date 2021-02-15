const { Command } = require('discord.js');

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            allowDM: false,
            json: {
                name: 'leave',
                description: 'Leave a voice channel'
            },
            responses: {
                200: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! I have successfully left ${options.vc} 😊` }),
                400: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! I'm not in any voice channels to leave 😝` })
            }
        });
    }

    execute(interaction) {
        const { client, guild, channel } = interaction;
        return interaction.acknowledge({ hideSource: true }).then(() => {
            const voiceChannel = guild.me.voice.channel;
            if (!voiceChannel) return channel.send(this.responses[400](interaction));
            return Promise.resolve(voiceChannel.leave()).then(channel.send(this.responses[200](interaction, { vc: voiceChannel })));
        });
    }
}
