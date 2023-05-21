const fs = require('fs');
const Command = require('../dataModels/Command');
const ERRORS = require('../../errorCode.json');
const loghelper = require('../../common/helpers/loghelper');
const discernTableData = require('../helpers/discernHelpers/discernTableData');
const SaveFileHelper = require('../helpers/SaveFileHelper');
const { createDirSync } = require('../utils/utilityFuncs');
const manualGetRow = require('../helpers/discernHelpers/manualGetRow');
class ManuallyIdentify extends Command {
    /**
     * 手动识别网页数据
     * @param {Object} param 识别网页列表所需参数 {page}
     * @returns {Array} allListSelectors  返回自动识别到的所有列表选择器
     */
    constructor(id, context, param) {
        super(id, context);
        this.cmdName = '数据抓取';
        this.param = param;
    }

    async execute() {
        try {
            let targetFrame = null;
            if (!this.param.frameUrl) {
                targetFrame = this.context.page;
            } else {
                const frames = this.context.page.frames();
                targetFrame = frames.find((frame) => frame.url() === this.param.frameUrl);
            }
            // 调用识别数据类 传入page and selectors
            const discernDataHelper = new discernTableData({ page: targetFrame, ...this.param });
            // 开始抓取
            let tableData = [];
            try {
                tableData = await discernDataHelper.startClimb();
            } catch (error) {
                loghelper.error(`指令 ${this.cmdName} 执行失败,等待元素渲染超时`);
                return ERRORS.NOT_FOUND_DOM;
            }
            // 开始采集 保存数据
            if (!this.param.filePath) {
                return ERRORS.PARAMETER_ERROR;
            }
            // if (!fs.existsSync(this.param.filePath)) {
            //     createDirSync(this.param.filePath);
            // }
            if (!this.context.excelPath) {
                this.context.excelPath = new Array(1).fill(this.param.filePath);
            } else {
                //多个数据抓取
                if (!this.context.excelPath.find((cur) => cur === this.param.filePath)) {
                    // 去重
                    this.context.excelPath.push(this.param.filePath);
                }
            }
            const saveHelper = new SaveFileHelper(this.param.filePath);
            const curCount = saveHelper.gainCurrentCount('json');
            try {
                await saveHelper.writeJson(`${curCount}.json`, tableData);
            } catch (error) {
                loghelper.error(`指令 ${this.cmdName} 执行失败,页面 ${this.context.page.url()} 保存json数据失败`);
                return ERRORS.INTERNAL_ERROR;
            }
            const { err, msg } = ERRORS.SEND_DATA_SUCCESS;
            if (!process['env']['runEnv'] || process['env']['runEnv'] !== 'independent') {
                global.controllerProxy.sendData2Client(
                    this.context.wsId,
                    1,
                    err,
                    {
                        ...tableData,
                    },
                    msg
                );
            }
            return {
                ...ERRORS.SUCCESS,
                data: {
                    ...tableData,
                },
            };
        } catch (error) {
            loghelper.error(`指令 ${this.cmdName} 执行失败,参数: ${this.param},错误提示: ${error}`);
            return ERRORS.INTERNAL_ERROR;
        }
    }
}

module.exports = ManuallyIdentify;
