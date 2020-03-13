"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = __importDefault(require("child_process"));
const utils_1 = require("./utils");
const main_dao_1 = require("./main-dao");
//导出AE
exports.exportAtlas = (sender, aniName, images, frameEffects, outputpath) => {
    let tempFolder = path_1.default.join(main_dao_1.ENV_PATH.TEMP_PATH, 'atlas');
    let tmpAtlasFolder = path_1.default.join(tempFolder, aniName);
    outputpath = path_1.default.join(outputpath, 'out');
    if (!fs_1.default.existsSync(outputpath)) {
        fs_1.default.mkdirSync(outputpath);
    }
    utils_1.utils.mkdirsSync(tmpAtlasFolder);
    copyFile(images, tmpAtlasFolder);
    let cmd = `"${main_dao_1.ENV_PATH.ROOT_PATH}/libs/TP/atlas-generator" -S 2048 -s 2048 ${tempFolder} -o ${outputpath} --dataFormat atlas --scale 1 --force -c`;
    child_process_1.default.exec(cmd, {
        encoding: "binary",
        maxBuffer: 1024 * 1024 * 20
    }, (err, stdOut, stdErr) => {
        utils_1.utils.rmdirsSync(tempFolder);
        if (err) {
            sender.send('global-error', err.message);
        }
        else {
            mergeAtlasConf(outputpath, aniName, frameEffects);
            sender.send('save-atlas-succ', aniName, outputpath);
        }
    });
};
function mergeAtlasConf(dirname, aniName, frameEffects) {
    //读取原始的atlas配置
    let filePath = path_1.default.join(dirname, `${aniName}.atlas`);
    let atlasJson = JSON.parse(fs_1.default.readFileSync(filePath, { encoding: 'UTF-8' }));
    let atlasframes = [];
    let atlasmeta = atlasJson.meta;
    let lmin = 2048;
    let tmin = 2048;
    let rmax = 0;
    let hmax = 0;
    let pivot_y = 0;
    let pivot_x = 0;
    for (let index in atlasJson.frames) {
        let frame = atlasJson.frames[index];
        let x = Number(frame.spriteSourceSize.x);
        let y = Number(frame.spriteSourceSize.y);
        let w = Number(frame.frame.w);
        let h = Number(frame.frame.h);
        let sourceSizeW = Number(frame.sourceSize.w) >> 1;
        let sourceSizeH = Number(frame.sourceSize.h) >> 1;
        if (lmin > x) {
            lmin = x;
            pivot_x = sourceSizeW - x;
        }
        if (rmax < x + w)
            rmax = x + w;
        if (tmin > y) {
            tmin = y;
            pivot_y = sourceSizeH - y;
        }
        if (hmax < h) {
            hmax = h;
        }
        atlasframes.push(frame);
    }
    let mWidth = rmax - lmin;
    let mHight = hmax;
    //合并atlas配置和帧信息
    let atlasInfo = {}; // = { };
    let frameDatas = [];
    atlasInfo.pivot = { x: pivot_x, y: pivot_y };
    atlasInfo.meta = atlasmeta;
    atlasInfo.frames = frameDatas;
    for (let i = 0; i < frameEffects.length; i++) {
        let frameEffect = frameEffects[i];
        frameDatas[i] = JSON.parse(JSON.stringify(atlasframes[frameEffect.copyIndex]));
        frameDatas[i].spriteSourceSize.x = Number(frameDatas[i].spriteSourceSize.x) - lmin;
        frameDatas[i].spriteSourceSize.y = Number(frameDatas[i].spriteSourceSize.y) - tmin;
        frameDatas[i].sourceSize = { h: mHight, w: mWidth };
        frameDatas[i].ani = frameEffect;
    }
    fs_1.default.writeFileSync(filePath, JSON.stringify(atlasInfo));
}
function copyFile(images, tempFolder) {
    for (let i = 0; i < images.length; i++) {
        let image = images[i];
        if (image != "" && fs_1.default.existsSync(image)) {
            let fileName = path_1.default.basename(image);
            fs_1.default.copyFileSync(image, path_1.default.join(tempFolder, fileName));
        }
    }
}
