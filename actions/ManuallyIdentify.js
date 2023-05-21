const Action = require('../models/Action');
const ERRORS = require('../errorCode.json');
const loghelper = require('../common/helpers/loghelper');
const ManuallyIdentifyHelper = require('../common/helpers/ManuallyIdentify');

class ManuallyIdentify extends Action {
    /**
     * 动作-手动识别
     * @param {String} id 动作ID
     * @param {Object} options 参数列表
     * - targetId <String> 需要识别的页面的targetId
     * - area <String> 表格所在区域的选择器
     * - fields <Array> 字段的选择器集合
     */
    constructor(id, options) {
        super(id, options);
        this.name = '手动识别';
    }

    async main() {
        const activePage = global.controllerProxy.gainConfBrowserActPage();
        if (!activePage) {
            return ERRORS.NON_ASSOCIATED_PAGE;
        }
        const referenceArr = ['rowSelector', 'colSelector', 'area', 'frameUrl', 'standard','headData'];
        const COMPLETE = referenceArr.every((item) => Object.keys(this.options).includes(item));
        if (!COMPLETE) {
            return ERRORS.PARAMETER_ERROR;
        }
        const manuaHelper = new ManuallyIdentifyHelper({
            page: activePage,
            ...this.options
        });
        const result = await manuaHelper.execute();
        return {
            ...ERRORS.SUCCESS,
            data: {
                dataArr: result,
            },
        };
    }
}

module.exports = ManuallyIdentify;
