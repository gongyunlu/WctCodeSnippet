class Queue {
    /**
     * 队列
     */
    constructor() {
        this.count = 0;
        this.lowestCount = 0;
        this.items = {};
    }

    /**
     * 入队
     * @param {any} element 入队的元素
     */
    enqueue(element) {
        this.items[this.count] = element;
        this.count++;
    }

    /**
     * 出队
     * @returns <any> 队首元素
     */
    dequeue() {
        if (this.isEmpty()) {
            return undefined;
        }
        const result = this.items[this.lowestCount];
        delete this.items[this.lowestCount];
        this.lowestCount++;
        return result;
    }

    /**
     * 获取队首元素
     * @returns <any> 队首元素 
     */
    peek() {
        if (this.isEmpty()) {
            return undefined;
        }
        return this.items[this.lowestCount];
    }

    /**
     * 判断是否为空队列
     * @returns <Boolean> 是否为空队列
     */
    isEmpty() {
        return this.size() === 0;
    }

    /**
     * 获取队列长度
     * @returns <Number> 队列长度
     */
    size() {
        return this.count - this.lowestCount;
    }

    /**
     * 清空队列
     */
    clear() {
        this.items = {};
        this.count = 0;
        this.lowestCount = 0;
    }

    /**
     * 队列转字符串
     * @returns <String> 转换后的字符串
     */
    toString() {
        if (this.isEmpty()) {
            return '';
        }
        let objString = `${this.items[this.lowestCount]}`
        for (let i = this.lowestCount + 1; i < this.count; i++) {
            objString = `${objString},${this.items[i]}`;
        }
        return objString;
    }
}