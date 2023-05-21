const Task = require("../models/Task");
const ERRORS = require('../errorCode.json');

class TaskManager {
    /**
     * 任务管理器
     * @param {String} id 任务管理器ID
     */
    constructor(id) {
        this.id = id;
        this.taskMap = new Map();
        this.executingTask = null;
    }

    /**
     * 添加监听的任务
     * @param {String} id 任务ID
     * @param {Array} commands 指令参数集合
     * @param {String} wsId websocket连接ID
     * @returns 是否添加成功
     */
    addTask(id, commands, wsId) {
        if (!(id && commands)) {
            return ERRORS.PARAMETER_ERROR
        }
        if (!Array.isArray(commands)) {
            return ERRORS.PARAMETER_ERROR
        }
        const task = new Task(id, commands, wsId);
        this.taskMap.set(id, task);
        return ERRORS.SUCCESS
    }

    /**
     * 开始执行任务
     * @param {String} id 任务ID
     * @returns
     */
    async executeTask(id) {
        const task = this.taskMap.get(id);
        // return await task.execute();
        this.executingTask = task;
        const res = await task.execute();
        this.executingTask = null;
        return res;
    }

    /**
     * 终止执行任务
     * @param {String} id 任务ID,无此参数时终止所有正在执行的任务(弃用)
     * @returns
     */
    async terminateTask(id) {
        // const task = this.taskMap.get(id);
        // return await task.terminate();
        if (!this.executingTask) {
            return ERRORS.SUCCESS;
        } else {
            const res = await this.executingTask.terminate();
            return res;
        }
    }

    /**
     * 移除指定任务
     * @param {String} id 任务ID
     * @returns
     */
    removeTask(id) {
        if (!this.taskMap.has(id)) {
            return ERRORS.NOT_FOUND_TASK
        }
        this.taskMap.delete(id);
        return this.taskMap.has(id) ? ERRORS.INTERNAL_ERROR : ERRORS.SUCCESS
    }
}

module.exports = TaskManager;