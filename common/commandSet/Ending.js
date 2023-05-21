const Command = require('../dataModels/Command');
const Context = require('../../models/Context');
const loghelper = require('../../common/helpers/loghelper');
const ERRORS = require('../../errorCode.json');
const JSON2ExcelHelper = require('../helpers/JSON2ExcelHelper');
const { createDirSync } = require('../utils/utilityFuncs');
const path = require('path');

class Ending extends Command {
    /**
     * 指令-结束
     * @param {Context} context 上下文
     */
    constructor(id, context) {
        super(id, context);
        this.cmdName = '结束';
    }

    async main() {
        try {
            const needClose = !this.context.getAttribute('isExistPage');
            if (this.context.excelPath) {
                // 存在数据抓取
                let excel_folder_count = this.context.excelPath.length;
                while (excel_folder_count--) {
                    try {
                        const rootPath = this.context.excelPath[excel_folder_count];
                        createDirSync(path.resolve(rootPath, '../ExcelData'));
                        const saveExcel = new JSON2ExcelHelper(rootPath, 20000);
                        await saveExcel.writeJson2Excel();
                    } catch (error) {
                        // 捕获异常,非阻塞Ending指令
                        loghelper.error(`指令 ${this.cmdName} 执行失败，待转换JSON文件路径:${this.context.excelPath[excel_folder_count]}，错误信息:${error}`);
                        continue;
                    }
                }
            }
            if (needClose) {
                await this.context.page.close();
            }
            return ERRORS.SUCCESS;
        } catch (error) {
            loghelper.error(`指令 ${this.cmdName}执行失败,关闭浏览器失败`);
            return ERRORS.INTERNAL_ERROR;
        }
    }
}

module.exports = Ending;
