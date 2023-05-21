const ERRORS = require('../errorCode.json');
const loghelper = require('../common/helpers/loghelper');

class ActionDispatcher {
    /**
     * 动作分发器
     */
    constructor() {
        this.isExecuting = false;
        this.executingAction = null;
    }

    /**
     * 分发执行动作
     * @param {String} id 动作指令的ID 
     * @param {String} action 动作名称
     * @param {Page} page 目标页面
     * @param {Object} options 参数列表
     * @returns 执行返回结果
     */
    async dispatch(id, action, options = null) {
        // 非特殊动作无法同时执行
        if (this.isExecuting && action !== 'TerminateExecution') {
            loghelper.error(`${action}执行失败,上一个动作${this.executingAction.name}仍在执行`);
            return ERRORS.PREVIOUS_ACTION_IS_BEING_EXECUTED
        }
        this.isExecuting = true;
        const ActionClass = require(`../actions/${action}`);
        let executeResult = null;
        if (action === 'TerminateExecution') {
            const acitonInstance = new ActionClass(id, options);
            executeResult = await acitonInstance.execute();
        } else {
            this.executingAction = new ActionClass(id, options);
            executeResult = await this.executingAction.execute();
        }
        this.isExecuting = false;
        this.executingAction = null;
        return executeResult;
    }
}

module.exports = ActionDispatcher;