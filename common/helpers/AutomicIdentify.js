const loghelper = require('./loghelper');
const getListHelper = require('./discernHelpers/getListHelper');
const discernTableData = require('./discernHelpers/discernTableData');
class AutomicIdentifyHelper {
    /**
     * 自动识别网页列表选择器+抓取预览数据
     * @param {Object} param 识别网页列表所需参数 {page}
     * @returns {Array} allTableData  返回自动识别到的所有列表选择器+所有列表预览数据
     */
    constructor(param) {
        this.param = param;
    }

    async execute() {
        try {
            // 自动识别所有列表数据和选择器信息
            const allTableData = [];
            const getListSelectorHelper = new getListHelper(this.param.page);
            //    所有列表选择器
            const AllListSelector = await getListSelectorHelper.getAllListSelector();
            if (AllListSelector.length > 0) {
                for (let index = 0; index < AllListSelector.length; index++) {
                    const table = AllListSelector[index];
                    if (table.selectorsData.area === 'BODY') continue;
                    if (table.selectorsData.colSelector.length === 0 ||!table.selectorsData.rowSelector) continue;
                    // 调用识别数据类 传入page and selectors
                    const discernDataHelper = new discernTableData({ page: this.param.page, ...table.selectorsData, headData: [] });
                    // 开始抓取
                    let tableData = await discernDataHelper.startClimb();
                    if (tableData.headData.length > 0) {
                        allTableData.push({
                            tableData,
                            ...table.selectorsData,
                        });
                    }
                }
            }
            return allTableData;
        } catch (error) {
            loghelper.error(`识别列表选择器错误${error}`);
        }
    }
}

module.exports = AutomicIdentifyHelper;
