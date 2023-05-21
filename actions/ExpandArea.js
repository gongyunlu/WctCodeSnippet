const HighLightHandler = require('../helpers/HighLightHandler');
const SelectorBuilder = require('../helpers/SelectorBuilder');
const Action = require('../models/Action');
const ERRORS = require('../errorCode.json');
const loghelper = require('../common/helpers/loghelper');
const { deepClone } = require('../common/utils/utilityFuncs');
const DoublyLinkedList = require('../common/dataModels/DoublyLinkedList');

class ExpandArea extends Action {
    /**
     * 动作-扩大选择区域
     * @param {String} id 动作ID
     * @param {page} page 目标页面
     * @param {Object} options 参数列表
     */
    constructor(id, options) {
        super(id, options);
        this.name = '扩大选择区域';
    }

    async main() {
        const activePage = global.controllerProxy.getConfigurationBrowser().activePage;
        if (!activePage) {
            return ERRORS.NON_ASSOCIATED_PAGE;
        }
        const page = activePage.page;
        const linkList = this.options.linkList;
        if (linkList.isEmpty() || linkList.size() === 1) {
            loghelper.error(`ACTION ERROR - ${this.name}: 扩大选择区域失败`);
            return ERRORS.INTERNAL_ERROR;
        }
        const frames = page.frames().filter((frame) => frame.url());
        const targetFrame = frames.find((frame) => frame.url().indexOf(this.options.frameUrl) !== -1);
        // 清空上一次的高亮区域
        const hlHandler = new HighLightHandler();
        await hlHandler.removeHighlight(targetFrame, this.options.backendNodeId);
        //深拷贝链表
        let linkList_copy = new DoublyLinkedList();
        let c_p = linkList.getHead();
        do {
            linkList_copy.append(deepClone(c_p.data));
            c_p = c_p.next;
        } while (c_p.next);
        linkList_copy.append(deepClone(c_p.data));
        let pointer = linkList_copy.getTail();
        let tarBackendNodeId = '';
        // 定位当前target位置
        while (pointer.prev) {
            if (pointer.data.target) {
                delete pointer.data.target;
                Object.defineProperty(pointer.prev.data, 'target', {
                    value: true,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
                tarBackendNodeId = pointer.prev.data.backendNodeId;
                linkList_copy.removeTail();
                break;
            }
            pointer = pointer.prev;
            // 扩大区域
            linkList_copy.removeTail();
            if (linkList_copy.size() === 1) {
                // 如果找到body（最大区域） 再扩大回到初始扩大位置
                delete pointer.data.target;
                linkList_copy.removeTail();
                c_p = linkList.getHead();
                do {
                    linkList_copy.append(deepClone(c_p.data));
                    c_p = c_p.next;
                } while (c_p.next);
                linkList_copy.append(deepClone(c_p.data));
                pointer = linkList_copy.getTail();
                Object.defineProperty(pointer.data, 'target', {
                    value: true,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
            }
        }

        // 重置深拷贝的链表中的target标识
        let _p = linkList.getTail();
        while (_p.prev) {
            if (_p.data.backendNodeId === tarBackendNodeId) {
                Object.defineProperty(_p.data, 'target', {
                    value: true,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
                break;
            } else {
                delete _p.data.target;
                _p = _p.prev;
            }
        }
        pointer.prev.data.target = false
        const sBuilder = new SelectorBuilder();
        const new_selector = sBuilder.buildSelector(linkList_copy);
        pointer.prev.data.target = true
        // const new_backendNodeId = tarBackendNodeId;
        // 设置高亮
        await hlHandler.setHighlight(targetFrame, 'area', tarBackendNodeId, new_selector);
        return {
            ...ERRORS.SUCCESS,
            data: {
                frameUrl: this.options.frameUrl,
                selector: new_selector,
                backendNodeId: tarBackendNodeId,
                linkList: linkList,
            },
        };
        /**
         * 扩大选择区域遗留问题：
         * 1.子节点刚好覆盖父节点时，且子节点有background-color属性，由子节点扩大区域到父节点，父节点的background-color被遮挡.
         */
    }
}

module.exports = ExpandArea;
