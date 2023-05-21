const loghelper = require("../common/helpers/loghelper");
const MessageHandler = require('./MessageHandler');
const ERRORS = require("../errorCode.json");

class RequestHandler {
    constructor() {
        this.msgHandler = new MessageHandler();
        this.ws = null;
    }

    /**
     * 挂载websocket实例
     * @param {WebSocket} ws websocket实例
     * @returns 是否挂载成功
     */
    mountWebsocket(ws) {
        if (!this.ws) {
            this.ws = ws;
            return true;
        }
        return false;
    }

    /**
     * 处理Websocket的消息
     * @param {WebSocket} ws websocket实例
     * @param {Object} message 消息
     */
    async handle(ws, message) {
        // ...........
        ws.send(pkg);
    }
}

module.exports = RequestHandler;