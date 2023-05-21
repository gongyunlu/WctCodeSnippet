const { generateUUID, serializeLinkedList, deserializeLinkedList } = require('../common/utils/utilityFuncs');
const loghelper = require('../common/helpers/loghelper');
const DoublyLinkedList = require('../common/dataModels/DoublyLinkedList');

class MessageHandler {
    constructor() { }

    /**
     * 生成websocket数据包
     * @param {String} requestId 请求ID
     * @param {Number} type 消息类型
     * - 0 正常通信
     * - 1 数据推送
     * - 2 服务端警告
     * @param {Number} err 错误码
     * @param {Object} data 数据包中的data数据
     * @param {String} msg 提示信息
     * @returns 数据包
     */
    build(requestId, type, err, data, msg) {
        // ..............
    }

    /**
     * 解析websocket数据包
     * @param {Buffer} data_package 数据包
     * @returns 数据包中的数据
     * - code <Number> 是否为可用数据包.
     * -  0 合法请求,处理请求信息
     * - -1 合法请求,请求体中的数据无法解析,需返回错误提示
     * - -2 非法请求,不予处理
     */
    parse(data_package) {
        // 数据包非buffer类型
        // 数据包编码错误
        // 无requestId
        // 无请求类型
    }

    /**
     * 数据加密
     * @param {String} message 需要加密的序列化后的数据包字符串
     * @returns 加密后的字符串
     */
    encode(message) {
    }

    /**
     * 数据解密
     * @param {String} message 加密后的数据包字符串
     * @returns 解密后的字符串
     */
    decode(message) {
    }
}

module.exports = MessageHandler;