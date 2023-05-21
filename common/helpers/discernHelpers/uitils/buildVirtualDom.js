const diff = require('./diff');
class VNode {
    constructor(tagName, props, value, type, backendNodeId) {
        this.tagName = tagName; // 标签名
        this.props = props; // 值
        this.value = value; // 文本
        this.type = type; // 元素类型
        this.backendNodeId = backendNodeId; // backendNodeId
        this.children = []; // 子节点
    }
    appendChild(vnode) {
        if (vnode && vnode.tagName !== 'svg') {
            this.children.push(vnode);
        }
    }
}

function buildVirtual(node) {
    let nodeType = node.nodeType;
    let _vnode = null;
    let _backendNodeId = node.backendNodeId;
    if (nodeType === 1) {
        // 元素节点
        let nodeName = node.nodeName;

        // 属性，返回属性组成的为数组，把这个伪数组转换为对象

        let attrs = node.attributes;
        let props = {};

        // 循环attrs
        for (let i = 0; i < attrs.length; i += 2) {
            // attrs[i]是一个属性节点，取nodeName这个属性
            props[attrs[i]] = attrs[i + 1];
        }

        _vnode = new VNode(nodeName, props, '', nodeType, _backendNodeId);

        if (node.children && node.children.length > 0) {
            // 考虑node的子元素
            let childNodes = node.children;
            for (let i = 0; i < childNodes.length; i++) {
                //递归
                _vnode.appendChild(buildVirtual(childNodes[i]));
            }
        }
    } else if (nodeType === 3) {
        // 文本节点
        _vnode = new VNode(undefined, undefined, node.nodeValue, nodeType, _backendNodeId);
    }
    return _vnode;
}
async function getPatches(vNode) {
    // 差异 patches.item? 记录差异
    // 多行对比，缺失el，索引对应row的index
    let patchesArr = [];
    let rowPatch = [];
    for (let i = 0; i < vNode.children.length; i++) {
        let temp = [];
        for (let j = 0; j < vNode.children.length; j++) {
            if (i == j) continue;
            // temp.push(diff(vNode.children[i], vNode.children[j]));
            const patches = diff(vNode.children[i], vNode.children[j]);
            if (patches) {
                temp.push(patches);
            }
        }
        patchesArr.push(temp);
        // 内部长度
    }
    const notEmpty = (arr) => arr.some((obj) => Object.keys(obj).length !== 0);
    patchesArr.forEach((row, index) => {
        if (notEmpty(row)) {
            rowPatch.push({ row, index });
        }
    });
    return rowPatch;
}
/**
 * 对象深拷贝
 * @param {*} data 被拷贝的对象
 * @returns {Object} o 拷贝结果
 */
function deepClone(data) {
    const t = Array.isArray(data) ? 'array' : typeof data;
    let o;
    if (t === 'array') {
        o = [];
    } else if (t === 'object') {
        o = {};
    } else {
        return data;
    }
    if (t === 'array') {
        for (let i = 0; i < data.length; i++) {
            o.push(deepClone(data[i]));
        }
    } else if (t === 'object') {
        for (let i in data) {
            o[i] = deepClone(data[i]);
        }
    }
    return o;
}

/**
 * length最长的子项
 * @param {*} arr
 * @returns {Object} 长度，索引
 */
function longestOfArr(arr) {
    let max = arr[0].children ? arr[0].children.length : 0,
        b = 0;
    let obj = {};
    for (let i = 0; i < arr.length; i++) {
        // children长度是否相等
        let len = arr[i].children ? arr[i].children.length : 0;
        if (!obj[len]) {
            obj[len] = 1;
        } else {
            obj[len] += 1;
        }

        if (max < len) {
            max = len;
            b = i;
        }
    }
    if (Object.keys(obj).length === 1) {
        // 长度全部相等，判断children
        let prentArr = [];
        for (let j = 0; j < arr.length; j++) {
            const tr = arr[j];
            if (tr.children) {
                prentArr.push(_devidChildren(tr.children));
            }
        }
        let row = prentArr[0],
            rowIndex = 0;
        for (let i = 1; i < prentArr.length - 1; i++) {
            let flag = false;
            for (let k = 0; k < prentArr[i].length; k++) {
                const tdLen = prentArr[i][k];
                if (tdLen > row[k]) {
                    row = prentArr[i - 1];
                    rowIndex = i - 1;
                    flag = true;
                }
            }
            if (!flag) continue;
        }
        return { maxItemIndex: rowIndex };
    }
    return { maxItemIndex: b };
}
function _devidChildren(arr) {
    let lengthArr = [];
    for (let index = 0; index < arr.length; index++) {
        const child = arr[index];
        lengthArr.push(child.children ? child.children.length : 0);
    }
    return lengthArr;
}

function getMinDiffRow(arr) {
    let DiffRow = [];
    for (let i = 0; i < arr.length; i++) {
        const itemObj = arr[i];
        // itemObj.row
        let tempCount = 0;
        for (let j = 0; j < itemObj.row.length; j++) {
            const ele = itemObj.row[j];
            if (Object.keys(ele).length === 0) {
                tempCount++;
            }
        }
        DiffRow.push(tempCount);
    }
    return DiffRow.indexOf(Math.max(...DiffRow));
}
module.exports = {
    buildVirtual,
    getPatches,
    longestOfArr,
    deepClone,
    getMinDiffRow,
};
