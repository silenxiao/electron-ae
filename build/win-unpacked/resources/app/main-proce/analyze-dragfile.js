"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const images_1 = __importDefault(require("images"));
const path_1 = __importDefault(require("path"));
const main_dao_1 = require("./main-dao");
const utils_1 = require("./utils");
/** 分析拖拽的文件 */
exports.analyzeDragFile = (sender, dirname) => {
    let stat = fs_1.default.lstatSync(dirname);
    //如果是图集
    if (stat.isFile()) {
        analyzeAtlasFile(sender, dirname);
    }
    else {
        analyzeDirectory(sender, dirname);
    }
};
//如果拖拽的是文件夹，未打包的圖片集合
let analyzeDirectory = (sender, rootPath) => {
    var aniName = path_1.default.basename(rootPath);
    if (main_dao_1.aniDict.get(aniName)) {
        sender.send('ae-error', '列表中存在相同的动画:' + aniName);
        return;
    }
    let aniInfo = {};
    aniInfo.aniName = aniName;
    aniInfo.aniPath = rootPath;
    aniInfo.frameEffects = [];
    aniInfo.frameIndxs = [];
    aniInfo.images = [];
    aniInfo.pivot = {};
    var files = fs_1.default.readdirSync(rootPath);
    var indx = 0;
    files.forEach((fileName) => {
        let filePath = rootPath + "/" + fileName;
        var stat = fs_1.default.statSync(filePath);
        //行为目录下只分析文件
        if (!stat.isDirectory()) {
            var extname = path_1.default.extname(fileName);
            if (extname == ".jpg" || extname == ".png") {
                aniInfo.images.push(filePath);
                aniInfo.frameIndxs.push(indx);
                aniInfo.frameEffects.push({ isEffect: false, isHit: false, hitType: 0, offsetX: 0, offsetY: 0, layLevel: 0, copyIndex: indx, indxId: indx });
                indx++;
                aniInfo.pivot.x = images_1.default(filePath).size().width >> 1;
                aniInfo.pivot.y = images_1.default(filePath).size().height >> 1;
            }
        }
    });
    if (aniInfo.images.length > 0) {
        main_dao_1.aniDict.set(aniName, aniInfo);
        sender.send('drag-ani', aniInfo);
    }
    else {
        sender.send('global-error', `${aniName} 资源目录解析失败`);
    }
};
//如果拖拽的是图集
let analyzeAtlasFile = (sender, atlasPath) => {
    let extname = path_1.default.extname(atlasPath);
    let aniName = path_1.default.basename(atlasPath, extname);
    if (main_dao_1.aniDict.get(aniName)) {
        sender.send('global-error', `${aniName} 动画已存在`);
    }
    if (extname != '.atlas') {
        //拖拽是文件，不解析
        sender.send('global-error', '请拖拽存放【序列图文件夹】或者 【图集.atlas】文件');
        return;
    }
    var imgPath = atlasPath.replace(".atlas", ".png");
    if (!fs_1.default.existsSync(imgPath)) {
        sender.send('global-error', `找不到 ${aniName}.atlas 对于的图集图片`);
        return;
    }
    let aniInfo = {};
    aniInfo.aniName = aniName;
    aniInfo.aniPath = path_1.default.dirname(atlasPath);
    aniInfo.frameEffects = [];
    aniInfo.frameIndxs = [];
    aniInfo.images = [];
    aniInfo.pivot = {};
    let atlasInfo = JSON.parse(fs_1.default.readFileSync(atlasPath, { encoding: 'UTF-8' }));
    //分拆图集，将图片从图集中分离处理
    let srcImg = images_1.default(imgPath);
    //新建临时目录，存放分拆后的图集
    let tmp = path_1.default.join(main_dao_1.ENV_PATH.TEMP_PATH, 'ae', aniName);
    if (!fs_1.default.existsSync(tmp))
        utils_1.utils.mkdirsSync(tmp);
    let indx = 0;
    let pivotx = 0, pivoty = 0;
    for (let index in atlasInfo.frames) {
        let frame = atlasInfo.frames[index];
        if (!frame.ani) {
            frame.ani = { isEffect: false, isHit: false, hitType: 0, offsetX: 0, offsetY: 0, layLevel: 0, copyIndex: indx, indxId: indx };
        }
        else {
            frame.ani.indxId = indx;
        }
        let frameIndx = frame.ani.copyIndex;
        //当前帧未生成图片
        if (!aniInfo.images[frameIndx]) {
            pivotx = Number(frame.sourceSize.w) >> 1;
            pivoty = Number(frame.sourceSize.h) >> 1;
            var dst = images_1.default(frame.sourceSize.w, frame.sourceSize.h);
            var rect = frame.frame;
            var dstImgPath = path_1.default.join(tmp, ('00' + frameIndx).slice(-3) + '.png');
            dst.draw(images_1.default(srcImg, rect.x, rect.y, rect.w, rect.h), frame.spriteSourceSize.x, frame.spriteSourceSize.y)
                .save(dstImgPath);
            aniInfo.images[frameIndx] = dstImgPath;
        }
        indx++;
        aniInfo.frameEffects.push(frame.ani);
        aniInfo.frameIndxs.push(frameIndx);
    }
    if (atlasInfo.pivot)
        aniInfo.pivot = atlasInfo.pivot;
    else
        aniInfo.pivot = { x: pivotx, y: pivoty };
    if (aniInfo.images.length > 0) {
        main_dao_1.aniDict.set(aniName, aniInfo);
        sender.send('drag-ani', aniInfo);
    }
    else {
        sender.send('global-error', `${aniName}.atlas 图集解析失败`);
    }
};
