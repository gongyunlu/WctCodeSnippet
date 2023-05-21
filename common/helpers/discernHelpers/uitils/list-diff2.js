/**
 * Diff two list in O(N).
 * @param {Array} oldList - Original List
 * @param {Array} newList - List 在插入、删除或重排之后
 * @return {Object} - {moves: <Array>}
 *                  - Moves是指示如何删除和插入的列表
 */
function diff(oldList, newList, key) {
    var oldMap = makeKeyIndexAndFree(oldList, key);
    var newMap = makeKeyIndexAndFree(newList, key);

    var newFree = newMap.free;

    var oldKeyIndex = oldMap.keyIndex;
    var newKeyIndex = newMap.keyIndex;

    var moves = [];

    // 要操作的模拟列表
    var children = [];
    var i = 0;
    var item;
    var itemKey;
    var freeIndex = 0;

    // 首先检查旧列表中的item是否被移除
    while (i < oldList.length) {
        item = oldList[i];
        itemKey = getItemKey(item, key);
        if (itemKey) {
            if (!newKeyIndex.hasOwnProperty(itemKey)) {
                children.push(null);
            } else {
                var newItemIndex = newKeyIndex[itemKey];
                children.push(newList[newItemIndex]);
            }
        } else {
            var freeItem = newFree[freeIndex++];
            children.push(freeItem || null);
        }
        i++;
    }

    var simulateList = children.slice(0);

    // 删除不再存在的项目
    i = 0;
    while (i < simulateList.length) {
        if (simulateList[i] === null) {
            remove(i);
            removeSimulate(i);
        } else {
            i++;
        }
    }

    // i 指向新列表中的item
    // j 指向simulateList中的item
    var j = (i = 0);
    while (i < newList.length) {
        item = newList[i];
        itemKey = getItemKey(item, key);

        var simulateItem = simulateList[j];
        var simulateItemKey = getItemKey(simulateItem, key);

        if (simulateItem) {
            if (itemKey === simulateItemKey) {
                j++;
            } else {
                // 新item,插入
                if (!oldKeyIndex.hasOwnProperty(itemKey)) {
                    insert(i, item);
                } else {
                    // 若移除当前的simulateItem，则在正确的位置创建item
                    // 然后移除
                    var nextItemKey = getItemKey(simulateList[j + 1], key);
                    if (nextItemKey === itemKey) {
                        remove(i);
                        removeSimulate(j);
                        j++; // 移除后，当前的j是正确的，只需跳到下一个
                    } else {
                        // 插入item
                        insert(i, item);
                    }
                }
            }
        } 
        /* else {
            insert(i, item);
        } */

        i++;
    }

    function remove(index) {
        var move = { index: index, type: 0 };
        moves.push(move);
    }

    function insert(index, item) {
        var move = { index: index, item: item, type: 1 };
        moves.push(move);
    }

    function removeSimulate(index) {
        simulateList.splice(index, 1);
    }

    return {
        moves: moves,
        children: children,
    };
}

/**
 * 将列表转换为key-item keyIndex对象
 * @param {Array} list
 * @param {String|Function} key
 */
function makeKeyIndexAndFree(list, key) {
    var keyIndex = {};
    var free = [];
    for (var i = 0, len = list.length; i < len; i++) {
        var item = list[i];
        var itemKey = getItemKey(item, key);
        if (itemKey) {
            keyIndex[itemKey] = i;
        } else {
            free.push(item);
        }
    }
    return {
        keyIndex: keyIndex,
        free: free,
    };
}

function getItemKey(item, key) {
    if (!item || !key) return void 666;
    return typeof key === 'string' ? item[key] : key(item);
}

exports.makeKeyIndexAndFree = makeKeyIndexAndFree;
module.exports = diff;
