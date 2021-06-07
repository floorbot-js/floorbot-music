const Music = require('../music');

module.exports = class Media extends Music {

    constructor(client) {
        super(client, { id: 'media', name: 'Media', json: require('./media.json') })
    }

    async onCommand(interaction) {
        await interaction.defer();
        const response = await this.getMediaResponse(interaction);
        return interaction.followUp(response, 'Loaded media controls').then(msg => interaction.channel.replaceMediaMessage(msg));
    }
}
