const { spawn } = require('child_process');
const YoutubeDL = require('./youtube-dl');

module.exports = class AudioTrack {

    constructor(metadata) {
        this.metadata = metadata;
        this.title = metadata.title || metadata.fulltitle || null;
        this.url = metadata.webpage_url || metadata.url;
        this.thumbnail = metadata.thumbnail || null;
        this.duration = metadata.duration ?? null;
        this.live = metadata.is_live ?? null;

        this.viewCount = metadata.view_count ?? null;
        this.releaseDate = metadata.release_date ?? null; //20200525
    }

    static update(track) {
        if (track.title && track.thumbnail) return Promise.resolve(track);
        const args = ['--dump-json', '--no-warnings', '--ignore-errors'];
        return YoutubeDL.json(track.url, args).then(res => {
            if (res.length === 1) {
                track.metadata = res[0];
                track.title = track.metadata.title || track.metadata.fulltitle || null;
                track.thumbnail = track.metadata.thumbnail || null;
                track.duration = track.metadata.duration ?? null;
                track.live = track.metadata.is_live ?? null;

                this.viewCount = metadata.view_count ?? null;
                this.releaseDate = metadata.release_date ?? null; //20200525
            }
            return track;
        });
    }

    static generate(url, options = {}) {
        const args = ['--flat-playlist', '--dump-json', '--no-warnings', '--ignore-errors'];
        if (options.shuffle) args.push('--playlist-random');
        return YoutubeDL.json(url, args).then(res => {
            return res.map(info => new AudioTrack(info));
        });
    }
}
