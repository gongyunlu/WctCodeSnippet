const Action = require("../models/Action");
const ERRORS = require("../errorCode.json");

class TerminateExecution extends Action {
    /**
     * 动作-终止执行当前动作
     * @param {*} id 
     * @param {*} options 
     */
    constructor(id, options) {
        super(id, options);
        this.name = '终止执行当前动作';
    }

    async main() {
        const res = await global.controllerProxy.terminateAction();
        return res;
    }
}

module.exports = TerminateExecution;