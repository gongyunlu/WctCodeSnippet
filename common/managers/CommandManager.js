const Queue = require('../../common/dataModels/Queue');
const Context = require('../../models/Context');
const { sleep, createDirSync } = require('../utils/utilityFuncs');
const loghelper = require('../helpers/loghelper');
const ERRORS = require('../../errorCode.json');
const JSON2ExcelHelper = require('../helpers/JSON2ExcelHelper');
const path = require('path');
class CommandManager {
    /**
     * 指令管理器
     * @param {String} wsId websocket连接ID
     */
    constructor(wsId) {
        this.wsId = wsId;
        this.context = new Context();
        this.commandSet = new Queue();
        this.operatingStatus = 'ready';
        this.executingCmd = null;
        this.context.setAttribute('wsId', wsId);
        this.needSaveFile = false;
    }

    /**
     * 添加指令
     * @param {String} commandId 指令ID
     * @param {String} commandName 指令名称
     * @param {Object} param 参数对象
     */
    addCommand(commandId, commandName, param) {
        const CommandClass = require(`../commandSet/${commandName}`);
        const commandInstance = new CommandClass(commandId, this.context, param);
        this.commandSet.enqueue(commandInstance);
    }

    /**
     * 依次执行指令队列
     * @returns 执行结果
     */
    async execute() {
        this.operatingStatus = 'executing';
        let flag;
        while (!this.commandSet.isEmpty && this.operatingStatus !== 'stoped') {
            this.executingCmd = this.commandSet.dequeue();
            try {
                flag = await this.executingCmd.execute();
                if (!flag || !flag.err || flag.err !== 200) {
                    await this.terminate();
                    // flag = ERRORS.RUNTIME_ERROR;
                    break;
                }
            } catch (error) {
                loghelper.error(`指令-${this.executingCmd.id} 执行失败, ${error}`);
                flag = ERRORS.INTERNAL_ERROR;
                break;
            }
        }
        this.operatingStatus = 'finished';
        // flag = ERRORS.SUCCESS;
        return flag;
    }

    /**
     * 暂停执行指令队列
     */
    pause() {
        // ............
    }

    /**
     * 终止指令执行
     */
    async terminate() {
        this.executingCmd.operatingStatus = 'stoped';
        await this.executingCmd.terminate();
        this.operatingStatus = 'stoped';
        const needSaveFile = this._hasFetchData();
        if (needSaveFile && this.context.excelPath) {
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
        await sleep(500);
        return ERRORS.SUCCESS;
    }

    /**
     * 是否含有数据抓取
     */
    _hasFetchData() {
        if (this.executingCmd.cmdName === '数据抓取') {
            return true;
        }
        if (this.executingCmd.cmdName === '嵌套循环') {
            if (this.executingCmd.param && this.executingCmd.param.commandList && this.executingCmd.param.commandList.length > 0) {
                // return !!this.executingCmd.param.commandList.find((command) => command.name === 'ManuallyIdentify');
                const {
                    param: { commandList },
                } = this.executingCmd;
                // 递归判断是否需要保存excel数据
                this._loopCommand(commandList);
                return this.needSaveFile;
            }
        }
        return false;
    }

    /**
     * 递归判断指令列表是否含有数据抓取指令
     * @param {Array} commandList 指令列表
     * @returns {Boolean}
     */
    _loopCommand(commandList) {
        for (let i = 0; i < commandList.length; i++) {
            const command = commandList[i];
            if (command.name === 'ManuallyIdentify') {
                this.needSaveFile = true;
                break;
            }
            if (command.name === 'Loop' && command.options.commandList.length > 0 && !this.needSaveFile) {
                this._loopCommand(command.options.commandList);
            }
        }
    }
}

module.exports = CommandManager;
