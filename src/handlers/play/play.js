const AudioTrack = require('../../audio/audio-track');
const Music = require('../music');

module.exports = class Play extends Music {

    constructor(client) {
        super(client, { id: 'play', name: 'Play', json: require('./play.json') })
    }

    async onCommand(interaction) {
        await interaction.defer();

        if (interaction.options.has('now')) {
            const subCommand = interaction.options.get('now');
            const url = subCommand.options.get('url').value;
            const shuffle = subCommand.options.get('url')?.value ?? false;
            const response = await this.generateResponse(interaction, 'now', url, shuffle);
            return interaction.followUp(response).then(msg => interaction.channel.replaceMediaMessage(msg));
        }

        if (interaction.options.has('queue')) {
            const subCommand = interaction.options.get('queue');
            const url = subCommand.options.get('url').value;
            const shuffle = subCommand.options.get('url')?.value ?? false;
            const response = await this.generateResponse(interaction, 'queue', url, shuffle);
            return interaction.followUp(response).then(msg => interaction.channel.replaceMediaMessage(msg));
        }

        if (interaction.options.has('next')) {
            const subCommand = interaction.options.get('next');
            const url = subCommand.options.get('url').value;
            const shuffle = subCommand.options.get('url')?.value ?? false;
            const response = await this.generateResponse(interaction, 'next', url, shuffle);
            return interaction.followUp(response).then(msg => interaction.channel.replaceMediaMessage(msg));
        }
    }

    async generateResponse(interaction, method, url, shuffle) {
        return AudioTrack.generate(url, { shuffle }).then(tracks => {
            const userVoiceChannel = interaction.member.voice.channel
            if (!interaction.guild.me.voice.connection && userVoiceChannel && userVoiceChannel.joinable) userVoiceChannel.join();
            if (!tracks.length) return this.getMediaResponse(interaction, `Could not find any tracks for "${url}"`);
            if (method === 'now') interaction.guild.audioPlayer.now(tracks);
            if (method === 'queue') interaction.guild.audioPlayer.queue(tracks);
            if (method === 'next') interaction.guild.audioPlayer.next(tracks);
            return this.getMediaResponse(interaction, (`${tracks.length > 1 ? `Playlist (${tracks.length} tracks)` : 'Track'} added to queue\n${url}`));
        }).catch(error => {
            const info = /(?:ERROR: )([^\.\n\r]+)/gi.exec(error)?. [1] || null;
            if (info) return this.getMediaResponse(interaction, info);
            throw error;
        });
    }
}
