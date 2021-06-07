const { spawn } = require('child_process');

const parseJson = string => {
    string = string.split('\n').map(line => line.trim()).join('');
    let start = string.indexOf('{');
    let open = 0;
    const objects = [];
    for (let i = start; i < string.length; i++) {
        if ((string[i] === '{') && (i < 2 || string.slice(i - 2, i) !== '\\"')) open++;
        else if ((string[i] === '}') && (i < 2 || string.slice(i - 2, i) !== '\\"')) {
            open--;
            if (open === 0) {
                objects.push(JSON.parse(string.substring(start, i + 1)));
                start = i + 1;
            }
        }
    }
    return objects;
};

class YoutubeDL {

    static spawn(url, args) {
        return spawn('youtube-dl', [...args, url]);
    }

    static json(url, args) {
        return new Promise((resolve, reject) => {
            const stdout = [];
            const stderr = [];
            const downloader = YoutubeDL.spawn(url, args);
            downloader.stdout.on('data', (data) => stdout.push(data));
            downloader.stderr.on('data', (data) => stderr.push(data));
            downloader.on('exit', (code) => {
                if (code) return reject(stderr.join('').toString());
                return resolve(parseJson(stdout.join('').toString()));
            });
        });
    }
}

module.exports = YoutubeDL;
