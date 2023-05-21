const CommandManager = require("../common/managers/CommandManager");

class Task {
    /**
     * 任务
     * @param {String} id 任务ID
     * @param {Array} commands 指令集合
     * @param {String} wsId websocket连接ID
     */
    constructor(id, commands, wsId) {
        this.id = id;
        this.commands = commands;
        this.cmdManager = new CommandManager(wsId);
        this._generateCommandQueue();
        this.wsId = wsId;
    }

    /**
     * 生成待执行指令队列
     */
    _generateCommandQueue() {
        for (let i = 0; i < this.commands.length; i++) {
            const cmd = this.commands[i];
            this.cmdManager.addCommand(cmd.id, cmd.name, cmd.options);
        }
    }

    /**
     * 终止执行主功能函数
     */
    async terminate() {
        return await this.cmdManager.terminate();
    }

    async execute() {
        return await this.cmdManager.execute();
    }
}

module.exports = Task;