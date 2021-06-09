const Music = require('../music');

module.exports = class Media extends Music {

    constructor(client) {
        super(client, { id: 'media', name: 'Media', json: require('./media.json') })
        client.on('audio-cycle', async (audioPlayer, track) => {
            const message = audioPlayer.guild.mediaMessage;
            if (message) {
                const response = await this.getMediaResponse(message, 'Track completed');
                return message.edit(response);
            }
        });
    }

    async onCommand(interaction) {
        await interaction.defer();
        const response = await this.getMediaResponse(interaction, 'Loaded media controls');
        return interaction.followUp(response).then(msg => interaction.channel.replaceMediaMessage(msg));
    }
}
