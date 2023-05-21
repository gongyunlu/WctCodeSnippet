const fs = require('fs');
const path = require('path');
const Excel = require('exceljs');

class JSON2ExcelHelper {
    /**
     *
     * @param {*} rootPath 区域存JSON的路径
     * @param {*} rowsCount Excel存放最大行数
     */
    constructor(rootPath, rowsCount) {
        this.rowsCount = rowsCount;
        this.rootPath = rootPath;
        this.jsonFiles = [];
        this.rowArr = [];
        this.workbook = null;
        this.sheet = null;
        this.excelFolder = path.resolve(this.rootPath, '../ExcelData');
        this.startCount = 1;
        this._findJsonFile();
    }
    _init() {
        // 初始化Excel
        this.workbook = new Excel.Workbook();
        // 生成一个工作表
        this.sheet = this.workbook.addWorksheet('报表');
    }
    /**
     * 拼接Excel行数据，列数据
     * @param {*} table 每个JSON文件的parse数据
     */
    async writeExcel(table) {
        if (this.rowArr.length < this.rowsCount) {
            this._init();
            if (!this.sheet.columns) {
                // 表头
                let colArr = [];
                for (let i = 0; i < table.headData.length; i++) {
                    const headCol = table.headData[i];
                    colArr.push({
                        header: headCol.colValue,
                        key: i + 1,
                        width: 15,
                    });
                }
                this.sheet.columns = colArr;
            }
            for (let index = 0; index < table.bodyData.length; index++) {
                // 插入行数据
                const row = table.bodyData[index];
                let rowObj = {};
                //exceljs的行数据的key不能以0开始，这里就不解构rowData了
                for (let idx = 0; idx < row.rowData.length; idx++) {
                    let cur = row.rowData[idx];
                    rowObj[idx + 1] = cur;
                }
                this.rowArr.push(rowObj);
            }
        }
        if (this.rowArr.length >= this.rowsCount) {
            // 达到最大写入条数
            // 新建表插入数据
            this.sheet.addRows(this.rowArr);
            await this.workbook.xlsx.writeFile(path.resolve(this.excelFolder, `${path.basename(this.rootPath)}--${this.startCount}.xlsx`)).then(async () => {
                this.workbook = null;
                this.sheet = null;
                this.rowArr = [];
                this.startCount += 1;
                this._init();
            });
        }
    }
    async writeJson2Excel() {
        for (let i = 0; i < this.jsonFiles.length; i++) {
            const file = this.jsonFiles[i];
            let table = JSON.parse(fs.readFileSync(file));
            await this.writeExcel(table);
        }
        if (this.rowArr.length !== 0 && this.rowArr.length < this.rowsCount) {
            this.sheet.addRows(this.rowArr);
            await this.workbook.xlsx.writeFile(path.resolve(this.excelFolder, `${path.basename(this.rootPath)}--${this.startCount}.xlsx`));
        }
    }
    /**
     *
     * @param {*} type 文件后缀名
     */
    _findJsonFile() {
        let files = fs.readdirSync(this.rootPath);
        files.forEach((item, index) => {
            let stat = fs.statSync(`${this.rootPath}\\\\${item}`);
            if (stat.isFile()) {
                const extname = path.extname(`${this.rootPath}\\\\${item}`);
                if (extname === '.json') {
                    this.jsonFiles.push(`${this.rootPath}\\\\${item}`);
                }
            }
        });
    }
}
module.exports = JSON2ExcelHelper;
