class Queue {
    /**
     * 队列
     * @param {Array} items 队列元素集合
     */
    constructor(items) {
        this.items = items || [];
    }

    /**
     * 入队
     * @param {any} ele 需要插入的元素
     */
    enqueue(ele) {
        this.items.push(ele);
    }

    /**
     * 出队
     * @returns <any> 队首元素
     */
    dequeue() {
        return this.items.shift();
    }

    /**
     * 获取队首元素
     * @returns <any> 队首元素
     */
    front() {
        return this.items[0];
    }

    /**
     * 清空队列
     */
    clear() {
        this.items = [];
    }

    get size() {
        return this.items.length;
    }

    get isEmpty() {
        return !this.items.length;
    }
}

module.exports = Queue;