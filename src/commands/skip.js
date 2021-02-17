const AudioTrack = require('../../lib/AudioTrack');
const { Command } = require('discord.js');

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            allowDM: false,
            json: {
                name: 'skip',
                description: 'Skip the current track(s)',
                options: [{
                    type: 'INTEGER',
                    name: 'count',
                    required: false,
                    description: 'How many tracks to skip'
                }]
            },
            responses: {
                204: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! There are no tracks to skip 😒` }),
                205: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! I skipped \`${options.count}\` tracks and the queue is now empty 😕` }),
                400: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! I'm not sure how to skip \`${options.count}\` tracks 😬` })
            }
        });
    }

    execute(interaction) {
        const { client, guild, channel } = interaction;
        return interaction.acknowledge({ hideSource: true }).then(() => {
            const count = interaction.options?. [1]?.value || 1;
            if (count < 1) return channel.send(this.responses[400](interaction, { count }));
            const skipped = guild.audioPlayer.skip(count);
            if (!skipped.length) return channel.send(this.responses[204](interaction, { count: skipped.length }));
            if (!guild.audioPlayer.tracks.length) return channel.send(this.responses[205](interaction, { count: skipped.length }));
            return AudioTrack.update(guild.audioPlayer.tracks[0]).then(track => {
                const embed = this.getEmbedTemplate(interaction);
                embed.setAuthor('Now playing', null, url);
                embed.setThumbnail(track.thumbnail);
                embed.setTitle(track.title);
                embed.setURL(track.url);
                return channel.send({ embed });
            });
        });
    }
}
