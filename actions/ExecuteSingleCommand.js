const Action = require("../models/Action");
const ERRORS = require("../errorCode.json");
const Command = require("../common/dataModels/Command");

class ExecuteSingleCommand extends Action {
    /**
     * 动作-执行单个指令
     * @param {String} id 动作ID
     * @param {Object} options 参数列表
     */
    constructor(id, options) {
        super(id, options);
        this.name = '执行单个指令';
        this.command = null;
    }

    async main() {
        const { id, name, options } = this.options;
        if (!(id && name)) {
            return ERRORS.PARAMETER_ERROR;
        }
        this.command = await global.controllerProxy.generateSingleCommand(id, name, options);
        if (!(this.command instanceof Command)) {
            return this.command;
        }
        return await this.command.execute();
    }

    async terminate() {
        if (this.command) {
            await this.command.terminate();
            return ERRORS.TERMINATE_EXECUTION
        } else {
            return ERRORS.SUCCESS;
        }
    }
}

module.exports = ExecuteSingleCommand;