class IdentifyData {
    /**
     * 数据模型-识别数据
     * @param {String} frameUrl 数据列所在iframe的url
     * @param {String} selector 数据列的选择器
     * @param {String} colType 数据列的类型
     * - text 数据为元素的innerText
     * - src 数据为元素的src属性
     * - href 数据为元素的href属性
     * @param {Number} backendNodeId backendNodeId
     * @param {Array} dataList 数据列表
     */
    constructor(frameUrl, selector, colType, backendNodeId, dataList, curIndex,selectorList) {
        this.frameUrl = frameUrl;
        this.selector = selector;
        this.colType = colType;
        this.backendNodeId = backendNodeId;
        this.dataList = dataList;
        this.curIndex = curIndex;
        this.selectorList = selectorList;
    }
}

module.exports = IdentifyData;