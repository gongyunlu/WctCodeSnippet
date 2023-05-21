class Context {
    constructor() { }

    /**
     * 获取某个属性的值
     * @param {*} key 属性名
     * @returns 
     */
    getAttribute(key) {
        return this[key];
    }

    /**
     * 添加属性
     * @param {String} key 键名
     * @param {*} value 值
     */
    setAttribute(key, value) {
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        } else {
            Object.defineProperty(this, key, {
                value,
                writable: true,
                enumerable: true,
                configurable: true
            })
        }
    }
}

module.exports = Context;