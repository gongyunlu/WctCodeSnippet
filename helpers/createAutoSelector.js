const SelectorBuild = require("./SelectorBuilder");
const loghelper = require("../common/helpers/loghelper");


class createAutoSelector {
    /**
     * 2 接受C# 传来的backendNodeId 获取列表selector和frameUrl 调用识别指令
     * @param {Object} rootTree Dom树
     * @param {String} backendNodeId 列表backendNodeId
     * @returns {Object} selectorInfo  目标区域选择器和frameUrl
     */
    constructor(rootTree, backendNodeId) {
        this.rootTree = rootTree;
        this.backendNodeId = backendNodeId;
    }

    async getListInfo() {
        try {
            let domNodesHandler = new SelectorBuild(this.rootTree);
            const result = domNodesHandler.parseTree(this.rootTree, this.backendNodeId);
            const selector = domNodesHandler.buildSelector(result.nodeLinkList);
            // 返回selector和frameUrl
            return { selector, frameUrl: result.frameUrl };
        } catch (error) {
            loghelper.error(error);
        }
    }
}

module.exports = createAutoSelector;
