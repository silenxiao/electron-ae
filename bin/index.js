/**
 * 设置LayaNative屏幕方向，可设置以下值
 * landscape           横屏
 * portrait            竖屏
 * sensor_landscape    横屏(双方向)
 * sensor_portrait     竖屏(双方向)
 */
window.screenOrientation = "sensor_landscape";

//-----libs-begin-----
loadLib("libs/laya.core.js")
loadLib("libs/laya.ui.js")
//-----libs-end-------
require("./libs/laya.core.js")
require("./libs/laya.ui.js")
require("./src/Main.js");

const { ipcRenderer } = require('electron');
let dragDiv = document;//.getElementById("dragDiv");

dragDiv.ondragover = () => {
    return false;
};

dragDiv.ondragleave = () => {
    return false;
};

dragDiv.ondragend = () => {
    return false;
};
dragDiv.ondrop = (evt) => {
    event.preventDefault()
    for (let f of evt.dataTransfer.files) {
        ipcRenderer.send('ondragstart', f.path.replace(/\\/g, "/"));
    }
}


ipcRenderer.send('reload');
