const fs = require('fs');
const path = require('path');
class saveJsonHelper {
    constructor(curPath, pageData) {
        this.curPath = path.resolve(curPath);
        this.pageData = pageData;
        this._mkdirsSync(this.curPath);
    }
    _mkdirsSync(curPath) {
        if (fs.existsSync(curPath)) {
            return true;
        } else {
            if (this._mkdirsSync(path.dirname(curPath))) {
                fs.mkdirSync(curPath);
                return true;
            }
        }
    }
    writeJson() {
        let fileName = this._readDir();
        fs.appendFileSync(path.resolve(this.curPath, fileName), JSON.stringify(this.pageData), function (err) {
            if (err) console.log(err);
        });
    }
    _readDir() {
        let files = fs.readdirSync(this.curPath);
        if (files.length > 0) {
            return `${files.length + 1}.json`;
        } else {
            return '1.json';
        }
    }
}
module.exports = saveJsonHelper;
