const Context = require('../../models/Context');
const Command = require('../dataModels/Command');
const ERRORS = require('../../errorCode.json');

class Beginning extends Command {
    /**
     * 指令-开始
     * @param {Context} context 上下文
     */
    constructor(id, context) {
        super(id, context);
        this.cmdName = '开始';
    }

    async main() {
        let browser = null;
        if (!process['env']['runEnv'] || process['env']['runEnv'] !== 'independent') {
            browser = global.controllerProxy.getConfigurationBrowser();
            this.context.setAttribute('browser', browser);
        }
        return ERRORS.SUCCESS;
    }
}

module.exports = Beginning;
