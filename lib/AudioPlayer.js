const AudioTrack = require('./AudioTrack');
const YoutubeDL = require('./YoutubeDL');
const { spawn } = require('child_process');

class AudioPlayer {

    constructor(guild) {
        this.volume = 1;
        this.guild = guild;
        this.client = guild.client;
        this.tracks = [];
        guild.client.on('voiceStateUpdate', (oldState, newState) => {
            if (oldState.guild === this.guild) {
                if (oldState.member.user === this.client.user) {
                    if (oldState.channel && !newState.channel) {
                        // console.log(`Voice channel ${oldState.channel left`);
                    }
                    if (!oldState.channel && newState.channel) {
                        // console.log(`Voice channel ${newState.channel joined`);
                        if (this.tracks.length) this._play();
                    }
                };
            }
        });
    }

    setVolume(val) {
        this.volume = parseFloat(val);
        const dispatcher = AudioPlayer.getDispatcher(this.guild);
        if (dispatcher) dispatcher.setVolume(this.volume * AudioPlayer.volumeScale);
    }

    queue(tracks) {
        this.tracks = this.tracks.concat(tracks);
        if (this.tracks.length === tracks.length) this._play();
    }

    next(tracks) {
        if (this.tracks.length) this.tracks.splice(1, 0, ...tracks);
        if (!this.tracks.length) this.tracks = this.tracks.concat(tracks);
        if (this.tracks.length === tracks.length) this._play();
    }

    skip(count = 1) {
        if (!this.tracks.length) return [];
        const skipped = this.tracks.splice(1, count - 1);
        if (count > 0) {
            skipped.splice(0, 0, this.tracks[0]);
            const dispatcher = AudioPlayer.getDispatcher(this.guild);
            if (dispatcher) dispatcher.end('skip');
        }
        return skipped;
    }

    _play() {
        if (!this.guild.me.voice.connection) return;
        const stderr = [];
        const args = ['--no-cache-dir', '--no-playlist', '--no-warnings', '--no-part', '--quiet', '--audio-quality', '0', '--output', '-'];
        const downloader = YoutubeDL.spawn(this.tracks[0].url, args);
        const dispatcher = this.guild.me.voice.connection.play(downloader.stdout); // THIS **SHOULD** KILL THE CURRENT DISPACTHER

        downloader.stderr.on('data', (data) => stderr.push(data));
        downloader.on('exit', (code) => { if (code) console.log(`youtube-dl code: ${code} ${stderr.join('').toString()}`); });

        dispatcher.setVolume(this.volume * AudioPlayer.volumeScale);
        dispatcher.on('finish', reason => {
            console.log('finishfinish')
            if (!downloader.killed) downloader.kill(2); // Livestreams would go on forever...
            if (this.guild.me.voice.connection) { // Should keep current song in queue but doesnt...
                this.tracks.shift();
                if (this.tracks.length) this._play();
            }
        });
    }

    static getDispatcher(guild) {
        if (!guild.me.voice.connection) return null;
        if (!guild.me.voice.connection.dispatcher) return null;
        return guild.me.voice.connection.dispatcher;
    }

    static getForGuild(guild) {
        if (!AudioPlayer.players.has(guild)) {
            AudioPlayer.players.set(guild, new AudioPlayer(guild));
        }
        return AudioPlayer.players.get(guild);
    }
}

AudioPlayer.players = new Map();
AudioPlayer.volumeScale = 0.2;
module.exports = AudioPlayer;
