// const _controller = Symbol('controller');
const _controller = new WeakMap();
const { sleep } = require('../common/utils/utilityFuncs');
const ERRORS = require('../errorCode.json');
const Context = require('../models/Context');

class ControllerProxy {
    /**
     * 全局控制器代理
     * @param {Controller} controller 控制器
     */
    constructor(controller) {
        // this[_controller] = controller;
        _controller.set(this, controller);
    }

    /**
     * 连接浏览器
     * @param {Object} options 参数列表
     * - host <String> 浏览器主机host
     * - port <String|Number> 浏览器端口号
     * - width <String|Number> 浏览器宽度
     * - height <String|Number> 浏览器高度
     * - isConfiguration <Boolean> 是否为配置浏览器
     * @returns 执行结果
     */
    async connBrowser(options) {
        // let result = await this[_controller].browserManager.connectBrowser(options);
        let result = await _controller.get(this).browserManager.connectBrowser(options);
        return result;
    }

    /**
     * 获取配置用的浏览器
     * @returns <Browser> 自定义的Browser实例
     */
    getConfigurationBrowser() {
        // return this[_controller].browserManager.configurationBrowser;
        return _controller.get(this).browserManager.configurationBrowser;
    }

    /**
     * 分发执行动作
     * @param {String} id 动作ID
     * @param {String} action 动作名称(文件名)
     * @param {Object} options 参数列表
     * @returns 动作执行结果
     */
    async dispatchAction(id, action, options) {
        // let result = await this[_controller].actionDispatcher.dispatch(id, action, options);
        let result = await _controller.get(this).actionDispatcher.dispatch(id, action, options);
        return result;
    }

    /**
     * 终止执行当前动作
     * @returns 是否终止成功
     */
    async terminateAction() {
        const executingAction = _controller.get(this).actionDispatcher.executingAction;
        if (!executingAction) {
            return ERRORS.SUCCESS;
        }
        executingAction.operatingStatus = 'stoped';
        let timer = null;
        let a = new Promise((resolve) => {
            setTimeout(() => {
                resolve(false);
            }, 30000);
        });
        let b = new Promise((resolve) => {
            timer = setInterval(async () => {
                if (executingAction.operatingStatus === 'finished') {
                    clearInterval(timer);
                    timer = null;
                    await sleep(200);
                    resolve(true);
                }
            }, 50);
        });
        const result = await Promise.race([a, b]);
        return result ? ERRORS.SUCCESS : ERRORS.TIMEOUT;
    }

    /**
     * 获取配置用浏览器的当前激活页面
     */
    gainConfBrowserActPage() {
        const confBrowser = this.getConfigurationBrowser();
        return confBrowser && confBrowser.activePage ? confBrowser.activePage.page : null;
    }

    /**
     * 生成单个指令
     * @param {String} id 指令ID
     * @param {String} name 指令名称
     * @param {Object} options 指令执行时所需的参数集合
     * @returns <Command> 指令实例
     */
    async generateSingleCommand(id, name, options) {
        if (!(id && name)) {
            return ERRORS.PARAMETER_ERROR;
        }
        let CommandClass;
        try {
            CommandClass = require(`../common/commandSet/${name}`);
        } catch (error) {
            return ERRORS.PARAMETER_ERROR;
        }
        const context = new Context();
        const configurationBrowser = this.getConfigurationBrowser();
        context.setAttribute('browser', configurationBrowser);
        const activePage = this.gainConfBrowserActPage();
        context.setAttribute('page', activePage);
        const command = new CommandClass(id, context, options);
        return command;
    }

    /**
     * 生成任务
     * @param {String} id 任务ID
     * @param {Array} commands 指令集
     * @param {String} wsId websocket连接ID
     * @returns
     */
    generateTask(id, commands, wsId) {
        return _controller.get(this).taskManager.addTask(id, commands, wsId);
    }

    /**
     * 执行任务
     * @param {String} id 任务ID
     * @returns 执行结果
     */
    async executeTask(id) {
        return await _controller.get(this).taskManager.executeTask(id);
    }

    /**
     * 终止任务
     * @param {String} id 任务ID
     * @returns
     */
    async terminateTask(id) {
        return await _controller.get(this).taskManager.terminateTask(id);
    }

    /**
     * 向客户端发送数据
     * @param {String} wsId websocket连接ID,空值则向所有客户端发送广播
     * @param {Number} type 发送数据的类型
     * @param {Number} err 错误码
     * @param {Object} data 数据体
     * @param {String} msg 提示信息
     */
    sendData2Client(wsId, type, err, data, msg) {
        _controller.get(this).websocket.sendMessage(wsId, type, err, data, msg);
    }
}

module.exports = ControllerProxy;
