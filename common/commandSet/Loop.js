const Command = require('../dataModels/Command');
const Queue = require('../../common/dataModels/Queue');
const Context = require('../../models/Context');
const { sleep, createDirSync } = require('../../common/utils/utilityFuncs');
const ERRORS = require('../../errorCode.json');
const loghelper = require('../../common/helpers/loghelper');
const JSON2ExcelHelper = require('../helpers/JSON2ExcelHelper');
const path = require('path');

class Loop extends Command {
    /**
     * 指令-循环嵌套
     * @param {Context} context 上下文
     * @param {Object} param 参数
     */
    constructor(id, context, param) {
        super(id, context);
        this.cmdName = '嵌套循环';
        this.param = param;
        this.commandSet = new Queue();
        this._compileCommandSet();
        this.operatingStatus = 'ready';
        this.executingCmd = null;
    }

    /**
     * 生成循环中包含的指令集
     */
    _compileCommandSet() {
        for (let i = 0, len = this.param.commandList.length; i < len; i++) {
            let { id: c_id, name, options } = this.param.commandList[i];
            const CommandClass = require(`./${name}`);
            let command = new CommandClass(c_id, this.context, options);
            this.commandSet.enqueue(command);
        }
    }

    async main() {
        this.operatingStatus = 'executing';
        let timer = null;
        let isExecuteOver = new Promise(async (resolve) => {
            for (let i = 0; i < this.param.cycles; i++) {
                if (this.operatingStatus === 'stoped' || this.operatingStatus === 'finished') {
                    break;
                }
                let tempQueue = new Queue();
                while (!this.commandSet.isEmpty) {
                    if (this.operatingStatus === 'stoped' || this.operatingStatus === 'finished') {
                        break;
                    }
                    this.executingCmd = this.commandSet.dequeue();
                    tempQueue.enqueue(this.executingCmd);
                    let tempRes = await this.executingCmd.execute();
                    if (!tempRes || tempRes.err !== 200) {
                        let errObj = ERRORS.LOOP_IS_INTERRUPTED;
                        errObj.msg = `循环被中断,指令 ${this.executingCmd.cmdName} 执行失败,${tempRes.msg}`;
                        // return errObj;
                        if (this.context.excelPath) {
                            // 生成excel
                            let excel_folder_count = this.context.excelPath.length;
                            while (excel_folder_count--) {
                                try {
                                    const rootPath = this.context.excelPath[excel_folder_count];
                                    createDirSync(path.resolve(rootPath, '../ExcelData'));
                                    const saveExcel = new JSON2ExcelHelper(rootPath, 20000);
                                    await saveExcel.writeJson2Excel();
                                } catch (error) {
                                    // 捕获单个数据抓取异常，非阻塞指令terminate
                                    loghelper.error(`终止指令时保存Excel数据失败，待转换JSON文件路径:${this.context.excelPath[excel_folder_count]}，错误信息:${error}`);
                                    continue;
                                }
                            }
                        }
                        this.operatingStatus = 'stoped';
                        resolve(errObj);
                    }
                }
                this.commandSet = tempQueue;
                if (this.param.hasOwnProperty('waitingTime')) {
                    await sleep(this.param.waitingTime);
                }
            }
            this.operatingStatus = 'finished';
            resolve(ERRORS.SUCCESS);
        });
        let isStoped = new Promise((resolve) => {
            timer = setInterval(() => {
                if (this.operatingStatus === 'stoped') {
                    resolve(ERRORS.TERMINATE_EXECUTION);
                }
            }, 50);
        });
        let res = await Promise.race([isExecuteOver, isStoped]);
        clearInterval(timer);
        return res;
    }

    async terminate() {
        this.operatingStatus = 'stoped';
        if (this.executingCmd && this.executingCmd.terminate) {
            await this.executingCmd.terminate();
        }
    }
}

module.exports = Loop;
