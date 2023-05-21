const Command = require("../dataModels/Command");
const Context = require('../../models/Context');
const DiscernDataBySelector = require("../../helpers/DiscernDataBySelector");
const loghelper = require("../../common/helpers/loghelper");

class DiscernData extends Command {
    /**
     * 指令：3识别网页列表内容
     * @param {Context} context 上下文
     * @param {Object} param 识别网页列表所需参数 {backendNodeId}
     * @returns {Array} list 返回所识别到的数据（用于直接导出）
     */
    constructor(id, context, param) {
        super(id, context);
        this.cmdName = '';
        this.param = param;
    }

    async main() {
        try {
            const client = await this.context.page.target().createCDPSession();
            const rootTree = await client.send("DOM.getDocument", { pierce: true, depth: -1 });
            // 获取DOM树
            // 传来的选择器和frameUrl
            const { selector, frameUrl } = this.param;
            try {
                const DiscernData = new DiscernDataBySelector(client, this.context.page, rootTree, selector, frameUrl);
                const tableData = await DiscernData.getTableContent();
            } catch (error) {
                loghelper.error(`${error}`);
            }
        } catch (error) {
            loghelper.error(`指令 ${this.cmdName} 执行失败,识别数据错误 ${error}`);
        }
        // 传来的选择器和frameUrl
        // 抓取数据
    }
}

module.exports = DiscernData;
