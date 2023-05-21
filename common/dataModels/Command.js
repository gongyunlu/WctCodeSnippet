const ERRORS = require('../../errorCode.json');
const loghelper = require('../helpers/loghelper');

class Command {
    constructor(id, context) {
        this.id = id;
        this.context = context;
        this.operatingStatus = 'ready';
        this.timer = null;
    }

    /**
     * 主功能函数
     */
    async main() { }

    /**
     * 终止执行函数
     */
    async terminate() {
        return ERRORS.TERMINATE_EXECUTION;
    }

    async execute() {
        // 正常执行
        const isOver = new Promise(async (resolve) => {
            this.operatingStatus = 'executing';
            let res;
            try {
                res = await this.main();
            } catch (error) {
                loghelper.error(`指令 ${this.cmdName} 执行失败,${error}`);
                res = ERRORS.INTERNAL_ERROR;
            }
            resolve(res);
        })
        // 终止执行
        const isTerminated = new Promise((resolve) => {
            this.timer = setInterval(async () => {
                if (this.operatingStatus === 'stoped') {
                    const res = await this.terminate();
                    resolve(res);
                }
            }, 50);
        })
        const result = await Promise.race([isOver, isTerminated]);
        clearInterval(this.timer);
        this.timer = null;
        this.operatingStatus = 'finished';
        return result;
    }
}

module.exports = Command;