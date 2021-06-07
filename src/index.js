module.exports = (Discord) => {
    const required = [
        require('./structures/text-channel')(Discord),
        require('./structures/guild')(Discord)
    ]
    return {
        handlers: {
            leave: { class: require('./handlers/leave/leave') },
            join: { class: require('./handlers/join/join') },

            volume: { class: require('./handlers/volume/volume') },
            media: { class: require('./handlers/media/media') },
            play: { class: require('./handlers/play/play') },
            skip: { class: require('./handlers/skip/skip') }
        }
    }
}
