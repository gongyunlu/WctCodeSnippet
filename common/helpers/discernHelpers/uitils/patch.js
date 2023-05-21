var _ = require('./util');

var replace = 0;
var reorder = 1;
var props = 2;
var text = 3;

function patch(node, patches) {
    var walker = { index: 0 };
    const patchNode = dfsWalk(node, walker, patches);
    return patchNode;
}

function dfsWalk(node, walker, patches) {
    var currentPatches = patches[walker.index];

    var len = node.children ? node.children.length : 0;
    for (var i = 0; i < len; i++) {
        var child = node.children[i];
        walker.index++;
        dfsWalk(child, walker, patches);
    }

    if (currentPatches) {
        const patchNode = applyPatches(node, currentPatches);
        return patchNode;
    }
}

function applyPatches(node, currentPatches) {
    _.each(Object.values(currentPatches), function (currentPatch) {
        console.log(currentPatch);
        switch (currentPatch[0].type) {
            case 'replace':
                var newNode = typeof currentPatch.node === 'string' ? document.createTextNode(currentPatch.node) : currentPatch.node.render();
                /*   var newNode = typeof currentPatch.node === 'string' ? document.createTextNode(currentPatch.node) : currentPatch.node.render(); */
                node.parentNode.replaceChild(newNode, node);
                break;
            case 'reorder':
                reorderChildren(node, currentPatch.moves);
                break;
            case 'props':
                setProps(node, currentPatch.props);
                break;
            case 'text':
                if (node.textContent) {
                    node.textContent = currentPatch.content;
                } else {
                    //  ie
                    node.nodeValue = currentPatch.content;
                }
                break;
            default:
                throw new Error('未知补丁类型 ' + currentPatch[0].type);
        }
    });
}

function setProps(node, props) {
    for (var key in props) {
        if (props[key] === void 666) {
            node.removeAttribute(key);
        } else {
            var value = props[key];
            _.setAttr(node, key, value);
        }
    }
}

function reorderChildren(node, moves) {
    var staticNodeList = _.toArray(node.children);
    var maps = {};

    _.each(staticNodeList, function (node) {
        if (node.nodeType === 1) {
            var key = node.getAttribute('key');
            if (key) {
                maps[key] = node;
            }
        }
    });

    _.each(moves, function (move) {
        var index = move.index;
        if (move.type === 0) {
            // 移除item
            if (staticNodeList[index] === node.children[index]) {
                // 可能是为了插入而被移除
                node.removeChild(node.children[index]);
            }
            staticNodeList.splice(index, 1);
        } else if (move.type === 1) {
            // 插入item
            var insertNode = maps[move.item.key]
                ? maps[move.item.key].cloneNode(true) // 重用老item
                : typeof move.item === 'object'
                ? move.item.render()
                : document.createTextNode(move.item);
            staticNodeList.splice(index, 0, insertNode);
            node.insertBefore(insertNode, node.children[index] || null);
        }
    });
}

patch.replace = replace;
patch.reorder = reorder;
patch.props = props;
patch.text = text;

module.exports = patch;
