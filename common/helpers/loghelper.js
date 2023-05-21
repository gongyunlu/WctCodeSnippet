const log4js = require('log4js');
log4js.configure({
    appenders: {
        xly: {
            type: "dateFile",
            filename: "./logs/log_date/date",
            alwaysIncludePattern: true,
            pattern: "yyyy-MM-dd.log"
        },
        out: {
            type: 'stdout'
        }
    },
    categories: {
        default: {
            appenders: ["xly"],
            level: "info"
        }
    }
});
const logger = log4js.getLogger("xly");
module.exports = logger;