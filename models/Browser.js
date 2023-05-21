const PageJump = require('../common/helpers/pageJump');
const ERRORS = require('../errorCode.json');
const loghelper = require('../common/helpers/loghelper');
const urlModule = require('url');

class Browser {
    /**
     * 浏览器管理
     * Note: 该类存储的所有页面均以targetId的形式进行存储
     */
    constructor(id, client, wsId) {
        this.id = id;
        this.browser = client; // 浏览器对象
        this.wsId = wsId;
        this.activePage = null; // 当前激活页面
        this.pages = []; // 通过newPage打开的页面
        this.concurrentNumber = 0; // 并发数量
        this.browserDisconnectBindFuc = this.onBrowserDisconnect.bind(this);
    }

    async onMonitoring() {
        const pages = await this.browser.pages();
        for (let i = 0, len = pages.length; i < len; i++) {
            await this._exposeCustomFunction(pages[i]);
            let _page = null;
            // 判断是否重复添加
            if (idx !== -1) {
            } else {
            }
            // 获取当前激活的页面
            try {
            } catch (error) {
                loghelper.error(`获取当前激活的页面失败,${error}`);
                return ERRORS.CHANGE_ACTIVE_BROWSER_ERROR;
            }
        }
    }

    /**
     * 创建新的标签页
     */
    async newPage() {
        // ....
    }

    /**
     * 获取已打开的页面
     * @param {String} url 目标页面的url
     * @returns 目标页面
     */
    gainExistsPage(url) {
        // .......
    }

    /**
     * 关闭并移除页面
     * @param {page} page 需要移除的页面
     */
    async removePage(page) {
        const tId = page._target._targetId;
        await page.close();
        const targetPageIndex = this.pages.findIndex((el) => el.targetId === tId);
        if (targetPageIndex !== -1) {
            this.pages.splice(targetPageIndex, 1);
        }
    }

    /**
     * 重置浏览器数据
     */
    resetBrowser() {
        if (this.browser) {
            this.browser.off('disconnected', this.browserDisconnectBindFuc);
            this.browser.disconnect();
        }
        this.browser = null;
        this.activePage = null;
    }

    onBrowserDisconnect() {
        global.controllerProxy.terminateAction();
        global.controllerProxy.terminateTask();
        this.resetBrowser();
        if (!process['env']['runEnv'] || process['env']['runEnv'] !== 'independent') {
            const { err, msg } = ERRORS.BROWSER_DISCONNECT;
            global.controllerProxy.sendData2Client(this.wsId, 2, err, null, msg);
        }
    }

    /**
     * 注入自定义方法
     * @param {page} page page
     */
    async _exposeCustomFunction(page) {
        // .......
    }

    /**
     * 根据targetId查找页面
     * @param {String} targetId 页面的targetId
     * @returns
     */
    findPageWithTargetId(targetId) {
        if (!this.browser) {
            return null;
        }
        if (this.pages.length === 0 && this.associatedPages.length === 0) {
            return null;
        }
        let t = null;
        this.pages.find((page) => {
            if (page.targetId === targetId) {
                t = page.page;
                return;
            }
        });
        return t;
    }
}

module.exports = Browser;
