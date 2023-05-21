const Action = require('../models/Action');
const ERRORS = require('../errorCode.json');
const loghelper = require('../common/helpers/loghelper');
const AutomicIdentifyHelper = require('../common/helpers/AutomicIdentify');
class AutomicIdentify extends Action {
    /**
     * 动作-自动识别
     * @param {String} id 动作ID
     * @param {Object} options 参数列表
     */
    constructor(id, options) {
        super(id, options);
        this.name = '自动识别';
    }

    async main() {
        const activePage = global.controllerProxy.gainConfBrowserActPage();
        if (!activePage) {
            return ERRORS.NON_ASSOCIATED_PAGE;
        }
        const autoHelper = new AutomicIdentifyHelper({
            page: activePage,
        });
        const result = await autoHelper.execute();
        return {
            ...ERRORS.SUCCESS,
            data: {
                dataArr: result,
            },
        };
    }
}

module.exports = AutomicIdentify;
