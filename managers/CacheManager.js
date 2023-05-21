class CacheManager {
    /**
     * 全局数据缓存管理器
     * @returns CacheManager.instance 缓存管理器单例
     */
    constructor() {
        if (!CacheManager.instance) {
            CacheManager.instance = this
        }
        return CacheManager.instance;
    }

    /**
     * 设置缓存
     * @param {String} key 属性名
     * @param {any} value 属性值
     */
    setAttribute(key, value) {
        if (this.hasOwnProperty(key)) {
            this[key] = value;
        } else {
            Object.defineProperty(this, key, {
                value,
                enumerable: true,
                writable: true,
                configurable: true
            })
        }
    }

    /**
     * 获取缓存
     * @param {String} key 属性值
     * @returns 
     */
    getAttribute(key) {
        return this[key];
    }

    /**
     * 移除属性
     * @param {String} key 属性名
     * @returns 是否移除成功
     */
    removeAttribute(key) {
        if (!this.hasOwnProperty(key)) return false;
        delete this[key];
        return true
    }
}

module.exports = CacheManager;