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
        if (!voiceChannel) return this.getMediaResponse(interaction, `Sorry! I'm not sure what channel to join. Please specify or join a voice channel first`)
        if (voiceChannel.type !== 'voice') return this.getMediaResponse(interaction, `Sorry! ${channel} is not a voice channel`)
        if (!voiceChannel.joinable) return this.getMediaResponse(interaction, `Sorry! I can't seem to join ${channel}. Please check my permissions and the channel settings`)
        return voiceChannel.join().then(connection => {
            return this.getMediaResponse(interaction, `Joined voice channel ${voiceChannel}`)
        });
    }
}
