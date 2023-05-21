const loghelper = require('./common/helpers/loghelper');
const Controller = require("./models/Controller");
const ControllerProxy = require('./helpers/ControllerProxy');
const ERRORS = require('./errorCode.json');

const { err: er, msg } = ERRORS.INTERNAL_ERROR;
// 全局未处理异常处理。
process.on("uncaughtException", async err => {
    loghelper.error(err);
    global.controllerProxy.sendData2Client(null, 2, er, null, msg);
    await global.controllerProxy.terminateAction()
});
process.on("uncaughtExceptionMonitor", async err => {
    loghelper.error(err);
    global.controllerProxy.sendData2Client(null, 2, er, null, msg);
    await global.controllerProxy.terminateAction()
});
process.on("unhandledRejection", async err => {
    // 不处理puppeteer v12.0.1 连接浏览器的API内部错误提示,该错误不影响后续操作的执行
    if (err.message.indexOf('Cannot read property \'_updateClient\' of undefined') !== -1) {
        return;
    }
    if (err.message.indexOf('Cannot read properties of undefined (reading \'_updateClient\')') !== -1) {
        return;
    }
    if (err.message.indexOf('Protocol error') !== -1) {
        return;
    }
    loghelper.error(err);
    global.controllerProxy.sendData2Client(null, 2, er, null, msg);
    await global.controllerProxy.terminateAction()
});

(async () => {
    loghelper.info(`程序已启动 ${new Date().getTime()}`);
    // 创建控制器
    const controller = Controller.getInstance();
    // 创建控制器代理
    global.controllerProxy = new ControllerProxy(controller);
    controller.websocket.startSocket();
})();