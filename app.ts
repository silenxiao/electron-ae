import { app, BrowserWindow } from "electron"
import fs from "fs";
import path from "path";
import { ENV_PATH, globalParam } from "./main-proce/main-dao";
import { utils } from "./main-proce/utils";
import "./main-proce/ipcMain-on";
let mainWindow: BrowserWindow;

let createWindow = () => {
    mainWindow = new
        BrowserWindow({
            width: 1483,
            height: 964,
            titleBarStyle: 'hidden',
            useContentSize: false,
            resizable: true,
            webPreferences: {
                webSecurity: false,
                nodeIntegration: true
            },
            frame: true
        })
    mainWindow.loadFile('index.html');

    //打开开发者工具
    //mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
});

app.on('quit', () => {
    saveconfParam();
})

//保存ae的设置数据
let saveconfParam = () => {
    fs.writeFileSync(path.join(ENV_PATH.ROOT_PATH, 'data/config.json'), JSON.stringify(globalParam, null, 4));
}

//设置环境路径
let appPath = path.dirname(app.getPath('exe'))

if (__dirname.indexOf(appPath) < 0) {
    appPath = path.join(__dirname, '..');
} else {
    appPath = path.join(appPath, 'resources');
}
ENV_PATH.ROOT_PATH = appPath;
ENV_PATH.TEMP_PATH = path.join(appPath, 'data/tmp')
if (!fs.existsSync(ENV_PATH.TEMP_PATH)) {
    utils.mkdirsSync(ENV_PATH.TEMP_PATH);
}
ENV_PATH.CONF_PATH = path.join(appPath, 'data/confs')
if (!fs.existsSync(ENV_PATH.CONF_PATH)) {
    utils.mkdirsSync(ENV_PATH.CONF_PATH);
}
if (fs.existsSync(path.join(ENV_PATH.ROOT_PATH, 'data/config.json'))) {
    let conf = JSON.parse(fs.readFileSync(path.join(ENV_PATH.ROOT_PATH, 'data/config.json'), { encoding: 'UTF-8' }));
    globalParam.frameRate = conf.frameRate;
    globalParam.bgParam = conf.bgParam;
    if (globalParam.bgParam.url == 'scene.jpg') {
        globalParam.bgParam.posX = 145;
        globalParam.bgParam.coordinateX = 465;
    }
    globalParam.frameIntev = conf.frameIntev;
    globalParam.move_y = conf.move_y;
    if (conf.tinify_key)
        globalParam.tinify_key = conf.tinify_key;
    else
        globalParam.tinify_key = 'fHWleyCjV8lBEde9QWYFcmzMg7ns8fMb';
} 