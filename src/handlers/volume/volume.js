const Music = require('../music');

module.exports = class Volume extends Music {

    constructor(client) {
        super(client, { id: 'volume', name: 'Volume', json: require('./volume.json') })
    }

    async onCommand(interaction) {
        await interaction.defer();
        const volume = interaction.options.get('volume')?.value ?? 50;
        const response = await this.generateResponse(interaction, volume);
        return interaction.followUp(response).then(msg => interaction.channel.replaceMediaMessage(msg));
    }

    async generateResponse(interaction, volume = 50) {
        if (volume < 1) return this.getMediaResponse(interaction, `I'm not sure how to set the volume to \`${fill}%\``);
        interaction.guild.audioPlayer.setVolume(volume);
        return this.getMediaResponse(interaction, `Set the volume to ${volume}%`);
    }
}
