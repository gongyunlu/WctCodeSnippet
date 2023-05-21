class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.length = 0;
    }
    /**
     * 向尾部插入节点
     * @param {Object} element 节点的data
     * @returns {Boolean} 是否插入成功
     */
    append(element) {
        let node = new ListNode(element);
        let current = null;
        let previous = null;
        if (!this.head) {
            this.head = node;
        } else {
            current = this.head;
            while (current) {
                previous = current;
                current = current.next;
            }
            previous.next = node
            node.prev = previous
        }
        this.length++;
        return true;
    }

    /**
     * 向指定位置插入节点
     * @param {Number} position 插入的位置
     * @param {Object} element 插入节点的data
     * @returns {Boolean} 是否插入成功
     */
    insert(position, element) {
        if (position > -1 && position <= this.length) {
            let node = new ListNode(element);
            let current = this.head;
            let previous = null
            let index = 0;
            if (position === 0) {
                if (!this.head) {
                    this.head = node;
                } else {
                    node.next = this.head;
                    this.head.prev = node;
                    this.head = node;
                }
            } else {
                while (index++ < position) {
                    previous = current;
                    current = current.next;
                }
                if (position != this.length) {
                    node.next = current;
                    current.prev = node;
                }
                previous.next = node;
                node.prev = previous;
            }
            this.length++;
            return true;
        } else {
            return false;
        }
    };

    /**
     * 删除指定位置的节点
     * @param {Number} position 要删除的节点的位置
     * @returns {Boolean} 是否删除成功
     */
    removeAt(position) {
        if (position > -1 && position < this.length) {
            let current = this.head;
            let index = 0;
            let previous = null;
            if (position === 0) {
                this.head = this.head.next;
                this.head.prev = null;
            } else {
                while (index++ < position) {
                    previous = current;
                    current = current.next;
                }

                if (position === this.length - 1) {
                    previous.next = null;
                } else {
                    previous.next = current.next;
                    current.next.prev = previous;
                }
            };
            this.length--;
            return current.data;
        } else {
            return false;
        }
    };

    /**
     * 删除尾部节点
     * @returns {Boolean} 是否删除成功
     */
    removeTail() {
        if (this.length === 0) {
            return false;
        };
        let current = this.head;
        let previous = null;
        if (this.length === 1) {
            this.head = null;
            this.length--;
            return current.data;
        }
        while (current.next) {
            previous = current;
            current = current.next;
        }

        previous.next = null;
        this.length--;
        return current.data;
    };


    /**
     * 链表是否为空
     * @returns {Boolean} 是否为空链表
     */
    isEmpty() {
        return this.length === 0;
    };

    /**
     * 获取链表长度
     * @returns {Number} 链表长度
     */
    size() {
        return this.length;
    };

    /**
     * 获取链表头节点
     * @returns {Object} 链表头节点
     */
    getHead() {
        return this.head;
    };

    /**
     * 获取链表尾节点
     * @returns {Object} 链表尾节点
     */
    getTail() {
        let previous = null;
        let current = this.head;
        while (current) {
            previous = current;
            current = current.next;
        }
        return previous;
    };
}

class ListNode {
    constructor(element) {
        this.prev = null;
        this.next = null;
        this.data = element;
    }
}

module.exports = DoublyLinkedList;