const { Util, Mixin, MessageActionRow, MessageButton } = require('discord.js');
const AudioTrack = require('../audio/audio-track');
const { Command, Component } = Mixin;
const DHMS = require('dhms.js');

module.exports = class Music extends Mixin(Command, Component) {
    constructor(client, options) {
        super(client, Object.assign({ group: 'music' }, options));
    }

    async onComponent(interaction) {
        await interaction.deferUpdate();
        const data = JSON.parse(interaction.customID);

        const audioPlayer = interaction.guild.audioPlayer;
        if (data.id === 'volume') audioPlayer.setVolume(data.v ? audioPlayer.volume + data.v : 50);
        if (data.id === 'media' && data.f === 'play-pause') audioPlayer.togglePause();
        if (data.id === 'media' && data.f === 'shuffle') audioPlayer.shuffleQueue();
        if (data.id === 'skip') audioPlayer.skip(data.c);

        const response = await this.getMediaResponse(interaction, 'Media embed loaded');
        interaction.message.edit(response);
    }

    async getMediaResponse(interaction, messageText = null) {
        const audioPlayer = interaction.guild.audioPlayer;
        return Promise.allSettled([
            (audioPlayer.tracks.queue.length ? AudioTrack.update(audioPlayer.tracks.queue[0]) : null),
            (audioPlayer.tracks.queue.length > 1 ? AudioTrack.update(audioPlayer.tracks.queue[1]) : null),
            (audioPlayer.tracks.preceding.length ? AudioTrack.update(audioPlayer.tracks.preceding[audioPlayer.tracks.preceding.length - 1]) : null)
        ]).then(res => {
            if (res[0].reason) throw res[0].reason;
            const track = res[0].value || null;
            const nextTrack = res[1].value || null;
            const precedingTrack = res[2].value || null;

            const embed = this.getEmbedTemplate(interaction)
                .setImage('https://cdn.discordapp.com/attachments/645895035321319454/653541940205191198/blank.png')
                .setDescription(track ? (
                    `Duration: **${track.live ? '*live*' : DHMS.print(track.duration * 1000, { limit: 2 })}**\n` +
                    `View Count: **${track.viewCount ?? '*unknown*'}**\n` +
                    `Release Date: **${track.releaseDate ?? '*unknown*'}**\n`
                ) : 'Pelase use one of the following commands:\n\`/play now [url]\`\n\`/play queue [url]\`\n\`/play next [url]\`')
                .addField('Previous Track', precedingTrack ? (
                    `**[${Util.splitMessage(precedingTrack.title, {char: '', maxLength: 25, append: '...'})[0]}](${precedingTrack.url})**\n` +
                    `Duration: **${precedingTrack.live ? '*live*' : DHMS.print(precedingTrack.duration * 1000, { limit: 2 })}**\n` +
                    `View Count: **${precedingTrack.viewCount ?? '*unknown*'}**\n` +
                    `Release Date: **${precedingTrack.releaseDate ?? '*unknown*'}**\n`
                ) : '*Nothing to show*', true)
                .addField('Next Track', nextTrack ? (
                    `**[${Util.splitMessage(nextTrack.title, {char: '', maxLength: 25, append: '...'})[0]}](${nextTrack.url})**\n` +
                    `Duration: **${nextTrack.live ? '*live*' : DHMS.print(nextTrack.duration * 1000, { limit: 2 })}**\n` +
                    `View Count: **${nextTrack.viewCount ?? '*unknown*'}**\n` +
                    `Release Date: **${nextTrack.releaseDate ?? '*unknown*'}**\n`
                ) : '*Nothing to show*', true);
            if (!track) embed.setAuthor('No track currently playing');
            if (track) embed.setAuthor(track.title, track.thumbnail, track.url);
            embed.setFooter(
                audioPlayer.paused ? 'Paused' : (audioPlayer.tracks.queue.length ? 'Playing' : 'Idle') +
                ` - Queue: ${audioPlayer.tracks.queue.length} - Volume: ${audioPlayer.volume}%`
            );

            const actionRows = [
                new MessageActionRow().addComponents([
                    new MessageButton({ label: 'Reload', customID: JSON.stringify({ id: 'media', m: 'e' }), style: 3 }),
                    new MessageButton({ label: '<<<', customID: JSON.stringify({ id: 'skip', m: 'e', c: -1 }), style: 1 }),
                    new MessageButton({ label: 'Play/Pause', customID: JSON.stringify({ id: 'media', m: 'e', f: 'play-pause' }), style: 1 }),
                    new MessageButton({ label: '>>>', customID: JSON.stringify({ id: 'skip', m: 'e', c: 1 }), style: 1 }),
                    new MessageButton({ label: 'Shuffle', customID: JSON.stringify({ id: 'media', m: 'e', f: 'shuffle' }), style: 1 })
                ]),
                new MessageActionRow().addComponents([,
                    new MessageButton({ label: '-10', customID: JSON.stringify({ id: 'volume', m: 'e', v: -10 }), style: 2 }),
                    new MessageButton({ label: '-5', customID: JSON.stringify({ id: 'volume', m: 'e', v: -5 }), style: 2 }),
                    new MessageButton({ label: 'Reset Volume', customID: JSON.stringify({ id: 'volume', m: 'e', v: 0 }), style: 1 }),
                    new MessageButton({ label: '+5', customID: JSON.stringify({ id: 'volume', m: 'e', v: 5 }), style: 2 }),
                    new MessageButton({ label: '+10', customID: JSON.stringify({ id: 'volume', m: 'e', v: 10 }), style: 2 })
                ])
            ];
            const messageEmbed = this.getEmbedTemplate(interaction).setDescription(messageText);
            return { embed: embed, embeds: [embed, messageEmbed], components: actionRows }
        });
    }

    getEmbedTemplate(interaction, data) {
        const { user, member } = interaction;
        return super.getEmbedTemplate(interaction, data)
            .setFooter(member.displayName || user.username, user.displayAvatarURL());
    }
}
