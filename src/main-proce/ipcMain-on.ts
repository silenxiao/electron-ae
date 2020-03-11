import { ipcMain, dialog } from "electron";
import fs from "fs";
import path from "path";
import { utils } from "./utils";

//保存app的数据
export let saveAppData = () => {
    fs.writeFileSync(path.join(APP_PATH.ROOT_PATH, 'data/config.json'), JSON.stringify(app_data, null, 4));
}




//监听拖拽文件
ipcMain.on('ondragstart', (event, rootpath) => {
    //初始化文件夹

    //console.log(rootPath);
    let stat = fs.lstatSync(rootpath);
    var aniName = path.basename(rootpath);
    if (stat.isFile()) {
        var extname = path.extname(rootpath);
        aniName = aniName.substr(0, aniName.length - extname.length)
        var args = analyzeAniFile(rootpath, aniName, extname);
    } else {
        var args = analyzeAniDirectory(rootpath, aniName);
    }

    event.sender.send('drag-ani', aniName, args);
});

//删除动画
ipcMain.on('ani-del', (event, aniName) => {
    aniDict[aniName] = null;
    delete aniDict[aniName];
})


//监听打开文件
ipcMain.on('open-file-dialog', (event) => {
    let files = dialog.showOpenDialogSync({
        properties: ['openFile'],
        defaultPath: APP_PATH.ROOT_PATH,
        filters: [
            { name: 'Images', extensions: ['jpg', 'png'] }
        ]
    })
    if (files)
        event.sender.send('selected-img', files[0])
    return;
});

//保存ae
ipcMain.on('save-ae', (event, aniName, filePath, pivot, frames, framesData) => {
    let imgIndex = 0;
    let total = frames.length;
    let savePath = path.join(filePath, aniName);
    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath);
    }
    for (let i = 0; i < total; i++) {
        if (frames[i] == "") continue;
        let frameData = framesData[i];

        utils.saveAEImg(savePath, imgIndex, pivot, frames[i], frameData.offsetX, frameData.offsetY);
        imgIndex++;
    }
    event.sender.send('save-ae-succ', aniName, savePath);
});

//保存图集
ipcMain.on('save-atlas', (event, aniName, filePath, frames, framesData) => {
    exportAtlas(event.sender, aniName, frames, framesData, path);
});

//保存动画配置
ipcMain.on('save-ani-file', (event, fileName: string, framesData: FrameData) => {
    let filePath: string = path.join(APP_PATH.DATA_PATH, fileName + '.json');

    let framesDataStr = JSON.stringify(framesData, null, 4);
    fs.writeFileSync(filePath, framesDataStr);
    event.sender.send('selected-ani-conf', fileName, framesDataStr);
})

//读取动画配置
ipcMain.on('read-ani-conf-dialog', (event) => {
    let files = dialog.showOpenDialogSync({
        title: '读取配置',
        defaultPath: app_data.conf_path,
        filters: [
            { name: 'json文件', extensions: ['json'] }
        ]
    })
    if (files) {
        app_data.conf_path = path.dirname(filePath)
        var fileName = path.basename(filePath, '.json');
        let framesDataStr = fs.readFileSync(filePath).toString();
        event.sender.send('selected-ani-conf', fileName, framesDataStr);
    }
});

//读取默认文件夹的动画配置
ipcMain.on('read-ani-confs', (event) => {
    //读取保存的配置
    let confPath = APP_PATH.DATA_PATH;
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
                    event.sender.send('selected-ani-conf', confName, framesDataStr);
                }
            }
        })
    }
})

//读取背景参数
ipcMain.on('save-conf-data', (event, confData) => {
    app_data.frameRate = confData.frameRate;
    app_data.bgParam = confData.bgParam;
    app_data.frameIntev = confData.frameIntev;
})

ipcMain.on('read-conf-data', (event) => {
    event.sender.send('read-conf-data', app_data)
})