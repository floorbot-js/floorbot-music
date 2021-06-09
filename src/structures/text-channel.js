module.exports = Discord => {
    const { Structures } = Discord;
    return Structures.extend('TextChannel', TextChannel => {
        return class extends TextChannel {
            constructor(client, data) {
                super(client, data);
                this.mediaMessage = null;
            }

            replaceMediaMessage(message) {
                if (this.mediaMessage) this.mediaMessage.delete().catch(console.log);
                this.guild.mediaMessage = message;
                this.mediaMessage = message;
            }
        }
    });
}
