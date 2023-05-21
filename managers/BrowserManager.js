const Browser = require('../models/Browser');
const { generateUUID, sleep } = require('../common/utils/utilityFuncs');
const loghelper = require('../common/helpers/loghelper');
const ERRORS = require('../errorCode.json');
const puppeteer = require('puppeteer');
class BrowserManager {
    constructor() {
        this.browsers = [];
        this.configurationBrowser = null;
    }

    /**
     * 连接浏览器
     * @param {Object} options 配置参数
     * - host <String> 浏览器主机host
     * - port <String|Number> 浏览器端口号
     * - isConfiguration <Boolean> 是否为配置浏览器
     * @returns 是否连接成功提示
     */
    async connectBrowser(options) {
        if (this.configurationBrowser) {
            this.configurationBrowser.resetBrowser();
        }
        const { host, port, isConfiguration = 'true', wsId } = options;
        if (!host || !port) {
            return ERRORS.PARAMETER_ERROR;
        }
        let client = null;
        for (let i = 0; i < 15; i++) {
            try {
                client = await puppeteer.connect({
                    browserURL: `http://${host}:${port}`,
                    defaultViewport: null
                })
                if (client) {
                    break;
                }
            } catch (error) {
                if (i !== 14) {
                    await sleep(200);
                }
                continue;
            }
        }
        if (!client) {
            loghelper.error(`连接浏览器失败, http://${host}:${port}`);
            return ERRORS.CONNECT_BROWSER_FAILED;
        }
        const browserId = generateUUID();
        const browser = new Browser(browserId, client, wsId);
        const a = new Promise(async (resolve) => {
            try {
                await browser.onMonitoring();
            } catch (error) {
                ;
            }
            resolve(true);
        })
        const b = new Promise(resolve => {
            setTimeout(() => {
                resolve(false);
            }, 30000);
        })
        const rt = await Promise.race([a, b]);
        if (!rt) {
            return ERRORS.CONNECT_BROWSER_FAILED;
        }
        if (isConfiguration) {
            this.configurationBrowser = browser;
        } else {
            this.browsers.push({
                id: browserId,
                browser,
            });
        }
        return ERRORS.SUCCESS;
    }

    /**
     * 断开页面连接
     */
    async disconnect() {
    }

    /**
     * 获取指定类型的浏览器
     * @param {String} type 浏览器类型
     */
    getBrowserByType(type) {
    }
}

module.exports = BrowserManager;
