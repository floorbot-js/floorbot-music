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
            Promise.all(audioPlayer.tracks.queue.slice(1, 4).map(track => AudioTrack.update(track))),
            Promise.all(audioPlayer.tracks.preceding.slice(-3).map(track => AudioTrack.update(track)))
        ]).then(res => {
            if (res[0].reason) throw res[0].reason;
            const currentTrack = res[0].value || null;
            const upcomingTracks = res[1].value;
            const precedingTracks = res[2].value;

            const embed = this.getEmbedTemplate(interaction)
                .setImage('https://cdn.discordapp.com/attachments/645895035321319454/653541940205191198/blank.png')
                .setThumbnail(currentTrack?.thumbnail ?? undefined)
                .setDescription(currentTrack ? (
                    `Duration: **${currentTrack.live ? '*live*' : DHMS.print(currentTrack.duration * 1000, { limit: 2 })}**\n` +
                    `View Count: **${currentTrack.viewCount ?? '*unknown*'}**\n` +
                    `Release Date: **${currentTrack.releaseDate ?? '*unknown*'}**\n` +
                    `Total Like: **${currentTrack.likeCount ?? '*unknown*'}**\n` +
                    `Source: **${currentTrack.extractorKey ?? '*unknown*'}**\n`
                ) : 'Pelase use one of the following commands:\n\`/play now [url]\`\n\`/play queue [url]\`\n\`/play next [url]\`')
                .addField(`Previous Tracks (${audioPlayer.tracks.preceding.length})`, precedingTracks.length ? (precedingTracks.reverse().map((track, i) => `${-(i+1)}: **[${Util.splitMessage(track.title, {char: '', maxLength: 18, append: '...'})[0]}](${track.url})**`).join('\n')) : '*Nothing to show*', true)
                .addField(`Upcoming Tracks (${(audioPlayer.tracks.queue.length || 1) - 1})`, upcomingTracks.length ? (upcomingTracks.map((track, i) => `${i+1}: **[${Util.splitMessage(track.title, {char: '', maxLength: 18, append: '...'})[0]}](${track.url})**`).join('\n')) : '*Nothing to show*', true)
            if (!currentTrack) embed.setAuthor('No track currently playing');
            if (currentTrack) embed.setAuthor(currentTrack.title, currentTrack.thumbnail, currentTrack.url);
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
        const { user, member, author } = interaction;
        return super.getEmbedTemplate(interaction, data)
            .setFooter(member?.displayName || (user || author)?.username, (user || author).displayAvatarURL());
    }
}
