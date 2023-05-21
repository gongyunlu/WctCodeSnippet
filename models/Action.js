const ERRORS = require('../errorCode.json');

class Action {
    /**
     * 动作基类
     * @param {String} id 动作ID
     * @param {Object} options 参数列表
     */
    constructor(id, options) {
        this.id = id;
        this.options = options;
        /**
         * operatingStatus 运行状态
         * ready 就绪
         * executing 运行中
         * finished 运行完成
         * stoped 停止
         */
        this.operatingStatus = 'ready';
        this.timer = null;
    }

    /**
     * 主功能函数
     */
    async main() { }

    /**
     * 终止执行主功能函数
     * @returns
     */
    async terminate() {
        return ERRORS.TERMINATE_EXECUTION
    }


    /**
     * 执行动作
     * @returns 动作返回结果
     */
    async execute() {
        // 正常执行
        const isOver = new Promise(async (resolve) => {
            this.operatingStatus = 'executing';
            const res = await this.main();
            if (this.timer && this.operatingStatus === 'stoped') {
                clearInterval(this.timer);
            }
            resolve(res);
        })
        // 终止执行
        const isTerminated = new Promise((resolve) => {
            this.timer = setInterval(async () => {
                if (this.operatingStatus === 'stoped') {
                    clearInterval(this.timer);
                    const res = await this.terminate();
                    resolve(res);
                }
            }, 500);
        })
        const result = await Promise.race([isOver, isTerminated]);
        clearInterval(this.timer);
        this.timer = null;
        this.operatingStatus = 'finished';
        return result;
    }
}

module.exports = Action;