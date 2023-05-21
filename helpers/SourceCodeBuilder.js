const path = require('path');
const fs = require('fs');
const { createDirSync } = require('../common/utils/utilityFuncs');
const ERRORS = require('../errorCode.json');
const loghelper = require('../common/helpers/loghelper');
const fse = require('fs-extra');

class SourceCodeBuilder {
    constructor(targetPath) {
        this.targetPath = targetPath;
        // this.targetPath = 'C:\\Users\\零\\Desktop\\source'
    }

    build() {
        let template = fs.readFileSync(path.resolve(__dirname, '../models/template.js'), 'utf8');
        fs.writeFileSync(path.resolve(this.targetPath, 'index.js'), template, err => {
            loghelper.error(`生成源码错误, ${err}`);
            return ERRORS.INTERNAL_ERROR;
        })
        let cpCode = this._copyCommonFiles();
        if (cpCode === 0) {
            return ERRORS.SUCCESS;
        } else if (cpCode === -1) {
            return ERRORS.DIRECTORY_NOT_EXIST;
        } else if (cpCode === -2) {
            return ERRORS.DIRECTORY__NOT_EMPTY;
        }
    }

    /**
     * 拷贝文件夹
     * @returns <Number> 执行结果
     * -  0 拷贝成功
     * - -1 拷贝失败
     * - -2 非空文件夹
     */
    _copyCommonFiles() {
        const files = fs.readdirSync(path.resolve(__dirname, '../common'));
        if (files.length === 0) {
            return -2;
        }
        // 开始拷贝
        // fs.cpSync(path.resolve(__dirname, '../common'), this.targetPath);
        createDirSync(path.resolve(this.targetPath, 'common'));
        try {
            fse.copySync(path.resolve(__dirname, '../common'), path.resolve(this.targetPath, 'common'));
        } catch (error) {
            loghelper.error(`拷贝common文件夹失败, ${error}`);
            return -1;
        }
        fs.copyFileSync(path.resolve(__dirname, '../package.json'), path.resolve(this.targetPath, 'package.json'));
        createDirSync(path.resolve(this.targetPath, 'models'));
        fs.copyFileSync(path.resolve(__dirname, '../models/Task.js'), path.resolve(this.targetPath, 'models/Task.js'));
        fs.copyFileSync(path.resolve(__dirname, '../models/Context.js'), path.resolve(this.targetPath, 'models/Context.js'));
        fs.copyFileSync(path.resolve(__dirname, '../models/Browser.js'), path.resolve(this.targetPath, 'models/Browser.js'));
        fs.copyFileSync(path.resolve(__dirname, '../errorCode.json'), path.resolve(this.targetPath, 'errorCode.json'));
        return 0;
    }
}

module.exports = SourceCodeBuilder;