const fs = require('fs');
const path = require('path');
const { createDirSync } = require('../utils/utilityFuncs');

class SaveFileHelper {
    /**
     * 存储文件帮助类
     * @param {String} rootPath 存储路径
     */
    constructor(rootPath) {
        this.rootPath = rootPath;
        createDirSync(this.rootPath);
    }

    writeJson(fileName, jsonData) {
        fs.appendFileSync(path.resolve(this.rootPath, fileName), JSON.stringify(jsonData), (err) => {
            if (err) throw new Error(err);
        });
    }

    /**
     * 获取当前存储文件的文件名
     * @param {String} type 文件类型,例: 'png'/'json'
     * @returns <Number> 文件名
     */
    gainCurrentCount(type) {
        const files = fs.readdirSync(this.rootPath);
        let curCount;
        if (files.length === 0) {
            curCount = this._prefixZero(1);
        } else {
            let similarTypeFiles = [];
            files.forEach((file, idx) => {
                let ph = fs.statSync(`${this.rootPath}\\\\${file}`);
                // 判断当前项是否为文件
                if (ph.isFile()) {
                    // 判断是否为同类型文件
                    const extname = path.extname(`${this.rootPath}\\\\${file}`);
                    if (extname === `.${type}`) {
                        similarTypeFiles.push({
                            file,
                            extname,
                        });
                    }
                }
            });
            curCount = this._gainCurrentCount(similarTypeFiles);
        }
        return curCount;
    }

    /**
     * 数字前置补零
     * @param {Number} num 需要补零的数字
     * @param {Number} n 总计位数
     * @returns <String> 补零后的数字
     */
    _prefixZero(num, n = 5) {
        return (Array(n).join(0) + num).slice(-n);
    }

    /**
     * 清除前置补零
     * @param {String} str 需要清除前置补零的字符串
     * @returns <Number> 清除前置补零后的数字
     */
    _delPreZero(str) {
        return Number(str.split(/^0+/)[1]);
    }

    /**
     * 获取当前计数
     * @param {Array} arr 文件集合
     * @returns 当前计数
     */
    _gainCurrentCount(arr) {
        let sameTypeFiles = [];
        arr.forEach((item) => {
            const filename = path.basename(item.file, item.extname);
            if (/^\d{5}$/.test(filename)) {
                sameTypeFiles.push(this._delPreZero(filename));
            }
        });
        if (sameTypeFiles.length === 0) {
            return this._prefixZero(1);
        } else {
            const maxNum = Math.max(...sameTypeFiles);
            return this._prefixZero(maxNum + 1);
        }
    }
}

module.exports = SaveFileHelper;
