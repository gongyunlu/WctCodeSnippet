const exec = require('child_process').exec;

const isRunning = async query => {
    return new Promise((resolve, reject) => {
        try {
            let platform = process.platform;
            let cmd = '';
            switch (platform) {
                case 'win32':
                    cmd = `tasklist`;
                    break;
                case 'darwin':
                    cmd = `ps -ax | grep ${query}`;
                    break;
                case 'linux':
                    cmd = `ps -A`;
                    break;
                default:
                    break;
            }
            exec(cmd, (err, stdout, stderr) => {
                resolve(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
            });
        } catch (error) {
            reject(error);
        }
    });

}

// await isRunning('chrome.exe');

module.exports = isRunning;