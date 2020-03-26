import { ipcMain, dialog, app } from "electron";
import fs from "fs";
import path from "path";
import { utils } from "./utils";
import { exportAtlas } from "./export-altas"
import { analyzeDragFile, analyzeAtlasFile } from "./analyze-dragfile";
import { aniDict, ENV_PATH, globalParam } from "./main-dao";

//监听拖拽文件
ipcMain.on('ondragstart', (event, dragPath) => {
    analyzeDragFile(event.sender, dragPath)
});

//删除动画
ipcMain.on('ani-del', (event, aniName) => {
    aniDict.delete(aniName);
})

//监听打开文件
ipcMain.on('open-file-dialog', (event) => {
    let files = dialog.showOpenDialogSync({
        properties: ['openFile'],
        defaultPath: ENV_PATH.ROOT_PATH,
        filters: [
            { name: 'Images', extensions: ['jpg', 'png'] }
        ]
    })
    if (files)
        event.sender.send('selected-img', files[0])
    return;
});

//保存ae
ipcMain.on('save-ae', (event, aniName, frameEffects: FrameEffect[]) => {
    let aniInfo: AniInfo = aniDict.get(aniName);
    let imgIndex = 0;
    let total = frameEffects.length;
    let savePath = path.join(aniInfo.aniPath, aniName);
    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath);
    }
    for (let i = 0; i < total; i++) {
        let frameEffect = frameEffects[i];
        if (frameEffect.isBlank)
            utils.saveAEImg(savePath, imgIndex, aniInfo.pivot, '', frameEffect.offsetX, frameEffect.offsetY);
        else utils.saveAEImg(savePath, imgIndex, aniInfo.pivot, aniInfo.images[frameEffect.copyIndex], frameEffect.offsetX, frameEffect.offsetY);
        imgIndex++;
    }
    event.sender.send('save-ae-succ', aniName, savePath);
});

//保存图集
ipcMain.on('save-atlas', (event, aniName, frameEffects) => {
    let aniInfo: AniInfo = aniDict.get(aniName);
    exportAtlas(event.sender, aniName, aniInfo.images, frameEffects, aniInfo.aniPath);
});

//保存动画配置
ipcMain.on('save-ani-file', (event, fileName: string, framesData: FrameData) => {
    let filePath: string = path.join(ENV_PATH.CONF_PATH, fileName + '.json');
    let framesDataStr = JSON.stringify(framesData, null, 4);
    fs.writeFileSync(filePath, framesDataStr);
})

//读取动画配置
ipcMain.on('read-ani-conf-dialog', (event) => {
    let files = dialog.showOpenDialogSync({
        title: '读取配置',
        defaultPath: app.getPath('desktop'),
        filters: [
            { name: 'json文件', extensions: ['json'] }
        ]
    })
    if (files) {
        let filePath = files[0];
        var fileName = path.basename(filePath, '.json');
        let framesDataStr = fs.readFileSync(filePath).toString();
        event.sender.send('read-ani-conf', fileName, framesDataStr);
    }
});

//读取默认文件夹的动画配置
ipcMain.on('read-ani-confs', (event) => {
    //读取保存的配置
    let confPath = ENV_PATH.CONF_PATH;
    if (fs.existsSync(confPath)) {
        var files = fs.readdirSync(confPath);
        files.forEach((fileName, _index) => {
            let filePath = confPath + "/" + fileName;
            var info = fs.statSync(filePath)
            //行为目录下只分析文件
            if (!info.isDirectory()) {
                var extname = path.extname(fileName);
                if (extname == ".json") {
                    let confName = path.basename(filePath, '.json');
                    let framesDataStr = fs.readFileSync(filePath).toString();
                    event.sender.send('m2r_load-ani-conf', confName, framesDataStr);
                }
            }
        })
    }
})

//读取背景参数
ipcMain.on('r2m_save-conf', (event, val) => {
    globalParam.frameRate = val.frameRate;
    globalParam.bgParam = val.bgParam;
    globalParam.frameIntev = val.frameIntev;
})

ipcMain.on('r2m_read-conf', (event) => {
    event.sender.send('m2r_read-conf', globalParam);
})

//导入绑定特效和模型
ipcMain.on('r2m_import-atlas', (event, type) => {
    let files = dialog.showOpenDialogSync({
        title: '读取动画配置',
        defaultPath: app.getPath('desktop'),
        filters: [
            { name: 'atlas文件', extensions: ['atlas'] }
        ]
    })
    if (files) {
        let filePath = files[0];
        event.sender.send('m2r_import-atlas', type, analyzeAtlasFile(event.sender, filePath, true));
    }
});