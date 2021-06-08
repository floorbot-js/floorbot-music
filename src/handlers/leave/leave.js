const Music = require('../music');

module.exports = class Leave extends Music {

    constructor(client) {
        super(client, { id: 'leave', name: 'Leave', json: require('./leave.json') })
    }

    async onCommand(interaction) {
        await interaction.defer();
        const response = await this.generateResponse(interaction);
        return interaction.followUp(response).then(msg => interaction.channel.replaceMediaMessage(msg));
    }

    async generateResponse(interaction) {
        const voiceChannel = interaction.guild.me.voice.channel;
        if (voiceChannel) voiceChannel.leave();
        return this.getMediaResponse(interaction, `Left voice channel ${voiceChannel}`);
    }
}
