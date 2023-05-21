const Action = require("../models/Action");
const ERRORS = require("../errorCode.json");

class StartCollecting extends Action {
    /**
     * 动作-开始采集
     * @param {String} id 动作ID
     * @param {Object} options 参数列表
     */
    constructor(id, options) {
        super(id, options);
        this.name = '开始采集';
    }

    async main() {
        const { id, commands, wsId } = this.options;
        // 生成Task
        const buildStatus = global.controllerProxy.generateTask(id, commands, wsId);
        if (buildStatus.err !== 200) {
            return buildStatus;
        }
        // 执行Task
        const executeStatus = await global.controllerProxy.executeTask(id);
        return executeStatus;
    }

    async terminate() {
        const { id } = this.options;
        await global.controllerProxy.terminateTask(id);
        return ERRORS.TERMINATE_EXECUTION
    }
}

module.exports = StartCollecting;