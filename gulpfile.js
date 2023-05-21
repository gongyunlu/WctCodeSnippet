const {
    src,
    dest,
    series,
    parallel
} = require('gulp');
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const uglify = require('gulp-uglify');
const pipeline = require('readable-stream').pipeline;
const nexe = require('nexe');
const javascriptObfuscator = require('gulp-javascript-obfuscator');

let rootpath = __dirname;

/**
 * 清理dist文件夹
 * @returns null
 */
function clearTask() {
    return new Promise((resolve, reject) => {
        let folderPath = __dirname;
        let distPath = path.join(folderPath, 'dist');

        _delDir(distPath);
        resolve();
    });
}

function _delDir(p) {
    let files = [];

    if (fs.existsSync(p)) {
        files = fs.readdirSync(p);
        files.forEach((file) => {
            let curPath = p + "/" + file;

            if (fs.statSync(curPath).isDirectory()) {
                //递归删除文件夹
                if (file != "node_modules")
                    _delDir(curPath);
            } else {
                //删除文件
                fs.unlinkSync(curPath);
            }
        });
        // fs.rmdirSync(p);
    }
}

function copyActionsFolder() {
    return pipeline(src("actions/**/*.js"), uglify({
        compress: {
            drop_console: true
        },
        annotations: true,
        toplevel: true
    }), dest("./dist/actions/"));
    // return pipeline(src("actions/**/*.js"), javascriptObfuscator({
    //     compact: true
    // }), dest("./dist/actions/"));
}

function copyCommonFolder() {
    return pipeline(src("common/**/*.js"), uglify({
        compress: {
            drop_console: true
        },
        annotations: true,
        toplevel: true
    }), dest("./dist/common/"));

    // return pipeline(src("common/**/*.js"), javascriptObfuscator({
    //     compact: true
    // }), dest("./dist/common/"));
}

function copyHelpersFolder() {
    return pipeline(src("helpers/**/*.js"), uglify({
        compress: {
            drop_console: true
        },
        annotations: true,
        toplevel: true
    }), dest("./dist/helpers/"));

    // return pipeline(src("helpers/**/*.js"), javascriptObfuscator({
    //     compact: true
    // }), dest("./dist/helpers/"));
}

function copyManagersFolder() {
    return pipeline(src("managers/**/*.js"), uglify({
        compress: {
            drop_console: true
        },
        annotations: true,
        toplevel: true
    }), dest("./dist/managers/"));

    // return pipeline(src("managers/**/*.js"), javascriptObfuscator({
    //     compact: true
    // }), dest("./dist/managers/"));
}

function copyModelsFolder() {
    return pipeline(src("models/*.js"), uglify({
        compress: {
            drop_console: true
        },
        annotations: true,
        toplevel: true
    }), dest("./dist/models/"));
    // return pipeline(src("models/*.js"), javascriptObfuscator({
    //     compact: true
    // }), dest("./dist/models/"));
}

function copyTemplateFolder() {
    return pipeline(src("template/**/*.js"), uglify({
        compress: {
            drop_console: true
        },
        annotations: true,
        toplevel: true
    }), dest("./dist/template/"));

    // return pipeline(src("template/**/*.js"), javascriptObfuscator({
    //     compact: true
    // }), dest("./dist/template/"));
}

function copyIndexJs() {
    // ,"AES128CBC.js"
    // return pipeline(src(["index.js"]), uglify({
    //     compress: {
    //         drop_console: true
    //     },
    //     annotations: true,
    //     toplevel: true
    // }), dest("./dist/"));

    return pipeline(src(["index.js"]), javascriptObfuscator({
        compact: true
    }), dest("./dist/"));
}


function copyPackagejson() {
    return pipeline(src(["package.json", "errorCode.json"]), dest("./dist/"));
}


function nexebuild() {
    return nexe.compile({
        resources: ['./actions/**/*', './models/**/*', './common/**/*', './helpers/**/*', './managers/**/*', './models/**/*', './errorCode.json'], //['./**/*'],//
        input: './index.js',
        output: './wct5130service.exe',
        targets: 'windows-x64-14.4.0', // windows-x64-14.4.0  windows-x64-14.15.3
        build: true,
        cwd: path.join(rootpath, "dist"),
        vcBuild: ['nosign', 'release'],
        ico: '../client/Xly.TelecomFruad.Client/logo.ico',
        rc: {
            CompanyName: "四川效率源信息安全技术股份有限公司",
            PRODUCTVERSION: "3,0,2112,2316",
            FILEVERSION: "0,0,0,1",
            FileDescription: "WCT5310 SV",
            LegalCopyright: "四川效率源信息安全技术股份有限公司版权所有"
        }
    });
}

// module.exports.default = series(clearTask, viewSourceBuild, parallel(copyFiles, copyEntryjs), electronPackage, templateSourceBuild, copyExportTemplate, packedServer);
module.exports.default = series(clearTask, parallel(copyActionsFolder, copyModelsFolder, copyCommonFolder, copyHelpersFolder, copyManagersFolder, copyTemplateFolder, copyPackagejson, copyIndexJs), nexebuild);
// module.exports.default=series(nexebuild);