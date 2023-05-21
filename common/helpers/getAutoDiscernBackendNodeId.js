const FindTableBackendId = require("./FindTableBackendId");
class getAutoDiscernBackendNodeId {
    /**
     * 1 仅自动识别列表，获取列表backendNodeId组成的数组 与C#通信选择需识别的列表（切换backendNodeId）
     * @param {*} page page对象
     * @returns {Array} LIST 返回列表backendNodeId组成的数组,用于构建selector和frameUrl
     */
    constructor(page,rootTree) {
        this.page = page;
        this.rootTree = rootTree;
    }

    async getListInfo() {
        // 1.DOM快照，
        try {
            const findTable = new FindTableBackendId(this.rootTree,this.page);
            const list = await findTable.judgeRow(); //类似列表的区域 backendNodeId Array
            // 返回 列表backendNodeId组成的数组
            return list;
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = getAutoDiscernBackendNodeId;
