const AudioTrack = require('../../lib/AudioTrack');
const { Command } = require('discord.js');

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            allowDM: false,
            json: {
                name: 'next',
                description: 'Add tracks to next in queue',
                options: [{
                    type: 'STRING',
                    name: 'url',
                    required: true,
                    description: 'A media link or playlist to queue'
                }, {
                    type: 'BOOLEAN',
                    name: 'shuffle',
                    required: false,
                    description: '(default true) Should the linked media playlist be shuffled before queued'
                }]
            },
            responses: {
                400: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! It looks like I ran into an issue\n\n*${options.info}*` }),
                404: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! I could not find any tracks from \`${options.url}\`` })
            }
        });
    }

    execute(interaction) {
        const { guild, channel } = interaction;
        return interaction.acknowledge({ hideSource: true }).then(() => {
            const shuffle = interaction.options?. [1]?.value ?? true;
            const url = interaction.options[0].value;

            return AudioTrack.generate(url, { shuffle }).then(tracks => {
                if (!tracks.length) return channel.send(this.responses[404](interaction, { url }))

                guild.audioPlayer.next(tracks);
                const embed = this.getEmbedTemplate(interaction);
                embed.setAuthor(`${tracks.length} tracks added to next in queue`, null, url);
                if (tracks.length === 1) {
                    embed.setAuthor('Song added to next in queue', null, url);
                    embed.setThumbnail(tracks[0].thumbnail);
                    embed.setTitle(tracks[0].title);
                    embed.setURL(tracks[0].url);
                    return channel.send({ embed });
                }
                return channel.send({ embed });
            }).catch(error => {
                const info = /(?:ERROR: )([^\.\n\r]+)/gi.exec(error)?. [1] || null;
                if (info) return channel.send(this.responses[400](interaction, { info }));
                throw error;
            });
        });
    }
}
