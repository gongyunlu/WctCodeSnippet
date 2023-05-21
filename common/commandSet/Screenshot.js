const Command = require('../dataModels/Command');
const Context = require('../../models/Context');
const _path = require('path');
const loghelper = require('../../common/helpers/loghelper');
const { createDirSync } = require('../utils/utilityFuncs');
const ERRORS = require('../../errorCode.json');
const SaveFileHelper = require('../helpers/SaveFileHelper');
const ScreenshotHelper = require('../helpers/ScreenshotHelper');

class Screenshot extends Command {
    /**
     * 指令：截图
     * @param {String} id 指令ID
     * @param {Context} context 上下文
     * @param {Object} param 参数
     */
    constructor(id, context, param) {
        super(id, context);
        this.cmdName = '截屏';
        this.param = param;
        this.shotHelper = null;
    }

    async main() {
        if (!this.param.path || !this.param.type || !this.param.saveType) {
            return ERRORS.PARAMETER_ERROR;
        }
        const saveHelper = new SaveFileHelper(this.param.path);
        const curCount = saveHelper.gainCurrentCount(this.param.saveType);
        let path = '';
        path = _path.resolve(this.param.path, `${curCount}.${this.param.saveType}`);
        this.shotHelper = new ScreenshotHelper(this.context.page);
        if (this.param.type === 'page') {
            // 全页面截图
            const res = await this.shotHelper.fullPage(path, this.param.saveType);
            return res ? ERRORS.SUCCESS : ERRORS.INTERNAL_ERROR;
        } else if (this.param.type === 'dom') {
            // 选择元素进行截图
            // document.defaultView.getComputedStyle($0, null)
            // 通过计算margin top left x y等计算综合获取偏移量
            let targetFrame = null;
            if (!this.param.frameUrl) {
                targetFrame = this.context.page;
            } else {
                const frames = this.context.page.frames();
                targetFrame = frames.find((frame) => frame.url() === this.param.frameUrl);
            }
            const targetDom = await targetFrame.$(this.param.selector);
            try {
                await targetDom.screenshot({
                    path,
                    type: this.param.saveType,
                });
                return ERRORS.INTERNAL_ERROR;
            } catch (error) {
                loghelper.error(`指令 ${this.cmdName} 执行失败,页面 ${this.context.page.url()} 中的区域 ${this.param.options.selector} 截图失败`);
                return ERRORS.INTERNAL_ERROR;
            }
        } else {
            return ERRORS.PARAMETER_ERROR;
        }
    }
}

module.exports = Screenshot;
