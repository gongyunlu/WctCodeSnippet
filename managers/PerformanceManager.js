const osUtils = require('os-utils');

class PerformanceManager {
    constructor() {
        this.listeners = [];
        this.CPUUsage = 0;
        this.concurrencyNumber = 0;
        this.controller = null;
    }

    mountController(controller) {
        this.controller = controller;
    }

    /**
     * 增加监听者
     * @param {Object} listener 监听者
     */
    addListener(listener) {
        this.listeners.push(listener);
    }

    /**
     * 根据ID移除监听者
     * @param {String} listenerId 监听者的ID
     */
    removeListener(listenerId) {
        let index = this.listeners.findIndex(listener => listener.id === listenerId);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    }

    /**
     * 监听CPU使用率
     */
    listenCPUUsage() {
        setInterval(() => {
            osUtils.cpuUsage(v => {
                this.CPUUsage = v;
            });
            console.log(this.CPUUsage);
            if (this.CPUUsage >= 0.75) {
                this.listeners.forEach(listener => {
                    listener.receiveNotification({
                        code: 100,
                        msg: 'CPU使用率过高'
                    })
                })
            }
        }, 2000);
    }
}

module.exports = PerformanceManager;