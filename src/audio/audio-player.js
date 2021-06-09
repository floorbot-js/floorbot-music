const AudioTrack = require('./audio-track');
const YoutubeDL = require('./youtube-dl');
const { spawn } = require('child_process');

class AudioPlayer {

    constructor(guild) {
        this.volume = 50;
        this.paused = false;
        this.tracks = { queue: [], preceding: [] };

        this.guild = guild;
        this.client = guild.client;
        guild.client.on('voiceStateUpdate', (oldState, newState) => {
            if (oldState.guild === this.guild) {
                if (oldState.member.user === this.client.user) {
                    if (oldState.channel && !newState.channel) {
                        // console.log(`Voice channel ${oldState.channel left`);
                    }
                    if (!oldState.channel && newState.channel) {
                        // console.log(`Voice channel ${newState.channel joined`);
                        if (this.tracks.queue.length) this._play();
                    }
                };
            }
        });
    }

    /**
     * setVolume - Sets the volume of the guilds audio player
     *
     * @param {Float} val The volume to use
     * @return {Void} Resturns void
     */
    setVolume(val) {
        this.volume = parseFloat(val);
        const dispatcher = this.guild.me.voice?.connection?.dispatcher;
        if (dispatcher) dispatcher.setVolume(this.volume / 100 * AudioPlayer.volumeScale);
    }

    /**
     * now - Adds audio tracks to the beginning of the queue and skips current track
     *
     * @param {Array[AudioTrack]} tracks An array or single audio track
     * @return {Void} Returns void
     */
    now(tracks) {
        if (this.tracks.queue.length) this.tracks.preceding.push(this.tracks.queue.shift());
        this.tracks.queue.unshift(...tracks);
        return this._play();
    }

    /**
     * queue - Adds audio tracks the the end of queue
     *
     * @param {Array[AudioTrack]} tracks An array or single audio track
     * @return {Void} Returns void
     */
    queue(tracks) {
        this.tracks.queue.push(...tracks);
        if (this.tracks.length === tracks.length) return this._play();
        if (!this.guild.me.voice?.connection?.dispatcher) return this._play();
    }

    /**
     * next - Adds audio tracks to the beginning of the queue
     *
     * @param {Array[AudioTrack]} tracks An array or single audio track
     * @return {Void} Returns void
     */
    next(tracks) {
        this.tracks.queue.splice(1, 0, ...tracks);
        if (this.tracks.length === tracks.length) return this._play();
        if (!this.guild.me.voice?.connection?.dispatcher) return this._play();
    }

    /**
     * skip - Skips a specified amount of tracks
     *
     * @param {Integer} count The number of tracks to skip
     * @return {Array[AudioTrack]} The tracks skipped
     */
    skip(count = 1) {
        if (count < 0) return this.unskip(count);
        const skipped = this.tracks.queue.splice(0, count);
        this.tracks.preceding.push(...skipped);
        if (skipped.length) this._play();
        return skipped;
    }

    /**
     * unskip - The same as skip but not
     *
     * @param {Integer} count The number of tracks to unskip
     * @return {Array[AudioTrack]} The tracks unskipped
     */
    unskip(count = -1) {
        if (count > 0) return this.skip(count);
        const unskipped = this.tracks.preceding.splice(count, -count);
        this.tracks.queue.unshift(...unskipped);
        if (unskipped.length) this._play();
        return unskipped;
    }

    /**
     * togglePause - toggles whether the audio player is paused or not
     *
     * @return {Void} Returns void
     */
    togglePause() {
        this.paused = !this.paused;
        const dispatcher = this.guild.me.voice?.connection?.dispatcher;
        if (dispatcher && !this.paused) dispatcher.resume();
        if (dispatcher && this.paused) dispatcher.pause();
    }

    /**
     * shuffleQueue - Shuffles the current queue
     *
     * @return {Void} Returns void
     */
    shuffleQueue() {
        const array = this.tracks.queue;
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return this.tracks.queue = array;
    }

    /**
     * _play - Destroys any currently playing audio and starts the current track (to be used internally)
     *
     * @return {Void} Returns void
     */
    _play() {
        if (!this.guild.me.voice.connection || !this.tracks.queue.length) return;
        this.paused = false;
        const playingTrack = this.tracks.queue[0];
        const stderr = [];
        const args = ['--no-cache-dir', '--no-playlist', '--no-warnings', '--no-part', '--quiet', '--audio-quality', '0', '--output', '-'];
        this.client.emit('audio-start', this, playingTrack);
        const downloader = YoutubeDL.spawn(playingTrack.url, args);
        const dispatcher = this.guild.me.voice.connection.play(downloader.stdout); // THIS **SHOULD** KILL THE CURRENT DISPACTHER

        downloader.stderr.on('data', (data) => stderr.push(data));
        downloader.on('exit', (code) => { if (code) this.client.emit('log', `[audio-player](exit) youtube-dl code: ${code} ${stderr.join('').toString()}`) });

        dispatcher.setVolume(this.volume / 100 * AudioPlayer.volumeScale);
        dispatcher.on('finish', reason => {
            if (!downloader.killed) downloader.kill(2); // Livestreams would go on forever...
            if (playingTrack !== this.tracks.queue[0]) return this.client.emit('log', '[audio-player] dispatcher finished <not cycling tracks>');
            if (this.tracks.queue.length) this.tracks.preceding.push(this.tracks.queue.shift());
            this.client.emit('log', '[audio-player] dispatcher finished <cycling tracks>');
            this.client.emit('audio-cycle', this, playingTrack);
            return this._play();
        });
    }
}

AudioPlayer.volumeScale = 0.2;
module.exports = AudioPlayer;
