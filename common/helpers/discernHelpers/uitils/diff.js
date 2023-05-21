var _ = require('./util');
var patch = require('./patch');
var listDiff = require('./list-diff2');

function dfsWalk(oldNode, newNode, index, patches) {
    var currentPatch = [];

    // 节点被删除
    if (newNode === null) {
        // real DOM节点将在执行重排序时被删除，因此不需要在这里做任何事情
        // TextNode content replacing
    } else if (_.isString(oldNode) && _.isString(newNode)) {
        if (newNode !== oldNode) {
            // currentPatch.push({ type: patch.TEXT, content: newNode }) //只找el不同的 视为差异
        }
        // 节点是一样的
    } else if (oldNode.tagName === newNode.tagName) {
        // Diff props
        /*  var propsPatches = diffProps(oldNode, newNode)
    if (propsPatches) {
      currentPatch.push({ type: patch.PROPS, props: propsPatches })
    } */
        // Diff 子节点。如果节点有' ignore '属性，不区分子节点
        if (!isIgnoreChildren(newNode)) {
            diffChildren(oldNode.children, newNode.children, patches, currentPatch);
        }
        // 如果节点不相同，视为替换
    } else {
        currentPatch.push({ type: 'replace', node: newNode });
    }

    if (currentPatch.length) {
        patches[index] = currentPatch;
    }
}

// 按顺序对比子节点
function diffChildren(oldChildren, newChildren, patches) {
    let count = 0;
    // 比较新旧子树的节点
    if (oldChildren && oldChildren.length) {
        oldChildren.forEach((child, index) => {
            count++;
            diff(child, (newChildren && newChildren[index]) || null, patches);
        });
    }

    // 如果还有未比较的新节点，继续进行diff将其标记为INSERT
    if (newChildren && newChildren.length) {
        while (count < newChildren.length) {
            diff(null, newChildren[count++], patches);
        }
    }
}
// 对比新旧节点，通过patches收集变化
function diff(oldNode, newNode, patches = []) {
    if (!newNode) {
        // 旧节点及其子节点都将移除
        patches.push({ type: 'REMOVE', oldNode });
    } else if (!oldNode) {
        // 当前节点与其子节点都将插入
        patches.push({ type: 'INSERT', newNode });
        diffChildren([], newNode.children, patches);
    } else if (oldNode.type !== newNode.type) {
        // 使用新节点替换旧节点
        patches.push({ type: 'REPLACE', oldNode, newNode });
        // 新节点的字节点都需要插入
        diffChildren([], newNode.children, patches);
    } else {
        // 继续比较子节点
        diffChildren(oldNode.children, newNode.children, patches);
    }
    // 收集变化
    return patches;
}
function diffAttr(oldAttrs, newAttrs) {
    let attrs = {};
    // 判断老的属性中和新的属性的关系
    for (let key in oldAttrs) {
        if (oldAttrs[key] !== newAttrs[key]) {
            attrs[key] = newAttrs[key]; // 有可能还是undefined
        }
    }
    for (let key in newAttrs) {
        // 老节点没有新节点的属性
        if (!oldAttrs.hasOwnProperty(key)) {
            attrs[key] = newAttrs[key];
        }
    }
    return attrs;
}

function isIgnoreChildren(node) {
    return node.props && node.props.hasOwnProperty('ignore');
}

module.exports = diff;
