// const { Frame } = require("_puppeteer@9.1.1@puppeteer");
const DoublyLinkedList = require('../common/dataModels/DoublyLinkedList');
const { deepClone, charToUnicode } = require('../common/utils/utilityFuncs');

class SelectorBuilder {
    /**
     * selector构造器
     */
    constructor() {
        this.isFind = false;
    }

    /**
     * 在DOM树中获取指定nodeId元素的路径
     * @param {Object} tree DOM.getDocument获取的DOM树
     * @param {Number} backendNodeId 元素的backendNodeId
     * @returns
     */
    parseTree(tree, backendNodeId) {
        const root = tree.root;
        this.isFind = false;
        let linkList = new DoublyLinkedList();
        this._parseTree(root, backendNodeId, linkList);
        // 将指针移动到目标节点所在的frame上
        let pointer = linkList.getHead();
        if (!pointer || !pointer.next) {
            return {
                frameUrl: '',
                nodeLinkList: linkList,
            };
        }
        while (pointer.next && !pointer.data.hasOwnProperty('contentDocument')) {
            pointer = pointer.next;
        }
        let result = new Object();
        result.frameUrl = pointer.data.hasOwnProperty('contentDocument') ? pointer.data.contentDocument.documentURL : '';
        // 将指针移动到目标节点所在的body上
        while (pointer.data.nodeName.toUpperCase() !== 'BODY') {
            pointer = pointer.prev;
        }
        result.nodeLinkList = new DoublyLinkedList();
        while (pointer) {
            if (pointer.data.nodeName.search('::') === -1) {
                result.nodeLinkList.append(deepClone(pointer.data));
            }
            pointer = pointer.prev;
        }
        return result;
    }

    /**
     * 根据target标识构造选择器
     * @param {Frame} targetFrame 元素所在的frame
     * @returns 元素的选择器
     */
    buildSelector(linkList, idx) {
        let selectorArr = [];
        let pointer = linkList.getHead();
        while (pointer && pointer.data.nodeType !== 3 && pointer.data.nodeType !== 8) {
            let curSelector = '';
            const classIndex = pointer.data.attributes.findIndex((attr) => attr === 'class');
            let classNames = classIndex === -1 ? '' : pointer.data.attributes[classIndex + 1];
            const { nodeName, nodeId, target } = pointer.data;
            if (nodeName.search('::') !== -1) {
                pointer = pointer.next;
                continue;
            }
            if (pointer.prev) {
                // 在链表中有父级元素
                const sameNodeNameNodes = pointer.prev.data.children.filter((child) => child.nodeName === nodeName);
                if (sameNodeNameNodes.length === 0) {
                    // ..........
                } else {
                    const nthOfType = sameNodeNameNodes.findIndex((node) => node.nodeId === nodeId);
                    if (!classNames) {
                        // ............
                    } else {
                        // .........
                        if (similarNodes.length === 1 || target) {
                            // .........
                        } else {
                            // ..............
                        }
                    }
                }
            } else {
                // 在链表中无父元素
            }
            selectorArr.push(curSelector);
            pointer = pointer.next;
        }
        const res = this.generateSelector(selectorArr);
        return res;
    }

    /**
     * 根据target标识构造元素的XPath
     * @param {Frame} targetFrame 元素所在的frame
     * @returns 元素的XPath
     */
    buildXPath(linkList, idx) {
        // ..........
    }

    /**
     * 构造下一页按钮的选择器
     * @param {DoublyLinkedList} linkList 元素层级双向链表
     * @returns 元素的选择器
     */
    buildNextPageSelector(linkList) {
        // ...
    }

    /**
     * 生成选择器
     * @param {Array} arr 选择器项数组
     * @returns 选择器
     */
    generateSelector(arr) {
        // ......
    }

    /**
     * 递归获取元素
     * @param {Object} node DOM元素
     * @param {Number} targetId 目标元素的backendNodeId
     * @param {DoublyLinkedList} linkList 用于存储的双向链表
     * @returns
     */
    _parseTree(node, targetId, linkList) {
        if (node.hasOwnProperty('contentDocument')) {
            node = node.contentDocument;
        }
        for (let i = 0; i < node.childNodeCount; i++) {
            let child = node.children[i];
            if (child.backendNodeId === targetId) {
                this.isFind = true;
                let child_clone = deepClone(child);
                // 删除子元素的子元素，避免浪费内存
                if (child_clone.nodeType !== 3 && child_clone.children) {
                    child_clone.children.forEach((ele) => {
                        delete ele.children;
                    });
                }
                linkList.append(child_clone);
                return;
            }
            this._parseTree(child, targetId, linkList);
            if (this.isFind) {
                let child_clone = deepClone(child);
                // 删除子元素的子元素，避免浪费内存
                if (child_clone.nodeType !== 3 && child_clone.children) {
                    child_clone.children.forEach((ele) => {
                        delete ele.children;
                    });
                }
                linkList.append(child_clone);
                return;
            }
        }
        if (node.pseudoElements) {
            for (let i = 0; i < node.pseudoElements.length; i++) {
                const pseudoEle = node.pseudoElements[i];
                if (pseudoEle.backendNodeId === targetId) {
                    this.isFind = true;
                    let pseudoEle_clone = deepClone(pseudoEle);
                    linkList.append(pseudoEle_clone);
                    return;
                }
            }
        }
    }

    /**
     * 判断class列表arr2是否包含class列表1中的所有项
     * @param {Array} arr1 class列表
     * @param {Array} arr2 class列表
     * @returns <Boolean> 是否全包含
     */
    judgeClassArrayIsSimilar(arr1, arr2) {
        let isSimilar = true;
        for (let i = 0; i < arr1.length; i++) {
            const item = arr1[i];
            const index = arr2.findIndex((el) => el === item);
            if (index === -1) {
                isSimilar = false;
                break;
            }
        }
        return isSimilar;
    }

    /**
     * class列表转class字符串
     * @param {Array} arr class列表
     * @returns class字符串
     */
    classArray2Str(arr) {
        return `.${arr.join('.')}`;
    }

    /**
     * 按照document.querySelector参数规范修正selector
     * @param {String} selector 需要修正的选择器字符串
     * @returns 修正后的选择器
     */
    selectorTransform(selector) {
        const reg = /(\.\d)|(#\d)/g;
        if (!selector.match(reg)) selector;
        let specialStrs = selector.match(reg);
        let res = selector;
        for (let i in specialStrs) {
            const str = specialStrs[i];
            const type = str[0];
            const unicode = charToUnicode(str[1]);
            const temp = type + unicode;
            res = selector.replace(str, temp);
        }
        return res;
    }
}

module.exports = SelectorBuilder;
