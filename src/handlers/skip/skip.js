const AudioTrack = require('../../audio/audio-track');
const Music = require('../music');

module.exports = class Skip extends Music {

    constructor(client) {
        super(client, { id: 'skip', name: 'Skip', json: require('./skip.json') })
    }

    async onCommand(interaction) {
        await interaction.defer();
        const count = interaction.options.get('count')?.value ?? 1;
        const response = await this.generateResponse(interaction, count);
        return interaction.followUp(response).then(msg => interaction.channel.replaceMediaMessage(msg));;
    }

    async generateResponse(interaction, count = 1) {
        if (count === 0) return this.getMediaResponse(interaction, `Unable to skip 0 tracks`);
        const audioPlayer = interaction.guild.audioPlayer;
        const skipped = audioPlayer.skip(count);
        if (!skipped.length) return this.getMediaResponse(interaction, `There are no tracks to skip`);
        return this.getMediaResponse(interaction, `Skipped ${skipped.length} track/s`);
    }
}
