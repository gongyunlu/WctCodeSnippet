const BrowserManager = require("../managers/BrowserManager");
const TaskManager = require("../managers/TaskManager");
const ActionDispatcher = require("../managers/ActionDispatcher");
const SocketHelper = require("../helpers/SocketHelper");

class Controller {
    static getInstance() {
        if (!Controller.instance) {
            Controller.instance = new Controller();
            return Controller.instance;
        }
    }
    constructor() {
        this.browserManager = null;
        this.taskManager = null;
        this.actionDispatcher = null;
        this.websocket = null;
        this.__init__();
    }

    __init__() {
        // 创建浏览器管理
        this.browserManager = new BrowserManager();
        // 创建任务管理器
        this.taskManager = new TaskManager();
        // 创建动作管理器
        this.actionDispatcher = new ActionDispatcher();
        // 创建websocket
        this.websocket = new SocketHelper();
    }
}

module.exports = Controller;