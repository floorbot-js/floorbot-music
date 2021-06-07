const Music = require('../music');

module.exports = class Join extends Music {

    constructor(client) {
        super(client, { id: 'join', name: 'Join', json: require('./join.json') })
    }

    async onCommand(interaction) {
        await interaction.defer();
        const channel = interaction.options.get('voice_channel')?.channel;
        const response = await this.generateResponse(interaction, channel);
        return interaction.followUp(response).then(msg => interaction.channel.replaceMediaMessage(msg));
    }

    async generateResponse(interaction, voiceChannel) {
        voiceChannel = voiceChannel || interaction.member.voice.channel;
        if (!voiceChannel) return this.getMediaResponse(interaction, `Sorry ${interaction.user}! Please join or specify a channel first`)
        if (voiceChannel.type !== 'voice') return this.getMediaResponse(interaction, `Sorry! ${channel} is not a voice channel`)
        if (!voiceChannel.joinable) return this.getMediaResponse(interaction, `Sorry! I can't seem to join ${channel}`)
        return voiceChannel.join().then(connection => {
            return this.getMediaResponse(interaction, `Joined channel "${voiceChannel.name}"`)
        });
    }
}
