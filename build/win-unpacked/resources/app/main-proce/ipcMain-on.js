"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const export_altas_1 = require("./export-altas");
const analyze_dragfile_1 = require("./analyze-dragfile");
const main_dao_1 = require("./main-dao");
//监听拖拽文件
electron_1.ipcMain.on('ondragstart', (event, dragPath) => {
    analyze_dragfile_1.analyzeDragFile(event.sender, dragPath);
});
//删除动画
electron_1.ipcMain.on('ani-del', (event, aniName) => {
    main_dao_1.aniDict.delete(aniName);
});
//监听打开文件
electron_1.ipcMain.on('open-file-dialog', (event) => {
    let files = electron_1.dialog.showOpenDialogSync({
        properties: ['openFile'],
        defaultPath: main_dao_1.ENV_PATH.ROOT_PATH,
        filters: [
            { name: 'Images', extensions: ['jpg', 'png'] }
        ]
    });
    if (files)
        event.sender.send('selected-img', files[0]);
    return;
});
//保存ae
electron_1.ipcMain.on('save-ae', (event, aniName, frameEffects) => {
    let aniInfo = main_dao_1.aniDict.get(aniName);
    let imgIndex = 0;
    let total = frameEffects.length;
    let savePath = path_1.default.join(aniInfo.aniPath, aniName);
    if (!fs_1.default.existsSync(savePath)) {
        fs_1.default.mkdirSync(savePath);
    }
    for (let i = 0; i < total; i++) {
        let frameEffect = frameEffects[i];
        if (frameEffect.copyIndex < 0)
            continue;
        utils_1.utils.saveAEImg(savePath, imgIndex, aniInfo.pivot, aniInfo.images[frameEffect.copyIndex], frameEffect.offsetX, frameEffect.offsetY);
        imgIndex++;
    }
    event.sender.send('save-ae-succ', aniName, savePath);
});
//保存图集
electron_1.ipcMain.on('save-atlas', (event, aniName, frameEffects) => {
    let aniInfo = main_dao_1.aniDict.get(aniName);
    export_altas_1.exportAtlas(event.sender, aniName, aniInfo.images, frameEffects, aniInfo.aniPath);
});
//保存动画配置
electron_1.ipcMain.on('save-ani-file', (event, fileName, framesData) => {
    let filePath = path_1.default.join(main_dao_1.ENV_PATH.CONF_PATH, fileName + '.json');
    let framesDataStr = JSON.stringify(framesData, null, 4);
    fs_1.default.writeFileSync(filePath, framesDataStr);
    event.sender.send('selected-ani-conf', fileName, framesDataStr);
});
//读取动画配置
electron_1.ipcMain.on('read-ani-conf-dialog', (event) => {
    let files = electron_1.dialog.showOpenDialogSync({
        title: '读取配置',
        defaultPath: electron_1.app.getPath('desktop'),
        filters: [
            { name: 'json文件', extensions: ['json'] }
        ]
    });
    if (files) {
        let filePath = files[0];
        var fileName = path_1.default.basename(filePath, '.json');
        let framesDataStr = fs_1.default.readFileSync(filePath).toString();
        event.sender.send('selected-ani-conf', fileName, framesDataStr);
    }
});
//读取默认文件夹的动画配置
electron_1.ipcMain.on('read-ani-confs', (event) => {
    //读取保存的配置
    let confPath = main_dao_1.ENV_PATH.CONF_PATH;
    if (fs_1.default.existsSync(confPath)) {
        var files = fs_1.default.readdirSync(confPath);
        files.forEach((fileName, _index) => {
            let filePath = confPath + "/" + fileName;
            var info = fs_1.default.statSync(filePath);
            //行为目录下只分析文件
            if (!info.isDirectory()) {
                var extname = path_1.default.extname(fileName);
                if (extname == ".json") {
                    let confName = path_1.default.basename(filePath, '.json');
                    let framesDataStr = fs_1.default.readFileSync(filePath).toString();
                    event.sender.send('selected-ani-conf', confName, framesDataStr);
                }
            }
        });
    }
});
//读取背景参数
electron_1.ipcMain.on('save-conf-data', (event, val) => {
    main_dao_1.globalParam.frameRate = val.frameRate;
    main_dao_1.globalParam.bgParam = val.bgParam;
    main_dao_1.globalParam.frameIntev = val.frameIntev;
});
electron_1.ipcMain.on('read-conf-data', (event) => {
    event.sender.send('read-conf-data', main_dao_1.globalParam);
});
