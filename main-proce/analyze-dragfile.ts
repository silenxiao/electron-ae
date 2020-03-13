import fs from 'fs';
import Images from 'images';
import path from 'path';
import { WebContents } from 'electron';
import { aniDict, ENV_PATH } from './main-dao';
import { utils } from './utils';

/** 分析拖拽的文件 */
export let analyzeDragFile = (sender: WebContents, dirname: string) => {
    let stat = fs.lstatSync(dirname);
    //如果是图集
    if (stat.isFile()) {
        analyzeAtlasFile(sender, dirname);
    } else {
        analyzeDirectory(sender, dirname);
    }
}

//如果拖拽的是文件夹，未打包的圖片集合
let analyzeDirectory = (sender: WebContents, rootPath: string) => {
    var aniName = path.basename(rootPath);
    if (aniDict.get(aniName)) {
        sender.send('ae-error', '列表中存在相同的动画:' + aniName);
        return;
    }

    let aniInfo: AniInfo = <AniInfo>{};
    aniInfo.aniName = aniName;
    aniInfo.aniPath = rootPath;
    aniInfo.frameEffects = [];
    aniInfo.frameIndxs = []
    aniInfo.images = [];
    aniInfo.pivot = <Point>{};

    var files = fs.readdirSync(rootPath);
    var indx = 0;
    files.forEach((fileName: string) => {
        let filePath = rootPath + "/" + fileName;
        var stat = fs.statSync(filePath)
        //行为目录下只分析文件
        if (!stat.isDirectory()) {
            var extname = path.extname(fileName);
            if (extname == ".jpg" || extname == ".png") {
                aniInfo.images.push(filePath);
                aniInfo.frameIndxs.push(indx);
                aniInfo.frameEffects.push({ isEffect: false, isHit: false, hitType: 0, offsetX: 0, offsetY: 0, layLevel: 0, copyIndex: indx, indxId: indx });
                indx++;
                aniInfo.pivot.x = Images(filePath).size().width >> 1;
                aniInfo.pivot.y = Images(filePath).size().height >> 1;
            }
        }
    })
    if (aniInfo.images.length > 0) {
        aniDict.set(aniName, aniInfo);
        sender.send('drag-ani', aniInfo);
    } else {
        sender.send('global-error', `${aniName} 资源目录解析失败`);
    }
}

//如果拖拽的是图集
let analyzeAtlasFile = (sender: WebContents, atlasPath: string) => {
    let extname = path.extname(atlasPath)
    let aniName = path.basename(atlasPath, extname)
    if (aniDict.get(aniName)) {
        sender.send('global-error', `${aniName} 动画已存在`);
    }
    if (extname != '.atlas') {
        //拖拽是文件，不解析
        sender.send('global-error', '请拖拽存放【序列图文件夹】或者 【图集.atlas】文件');
        return;
    }

    var imgPath = atlasPath.replace(".atlas", ".png");
    if (!fs.existsSync(imgPath)) {
        sender.send('global-error', `找不到 ${aniName}.atlas 对于的图集图片`);
        return;
    }

    let aniInfo: AniInfo = <AniInfo>{};
    aniInfo.aniName = aniName;
    aniInfo.aniPath = path.dirname(atlasPath);
    aniInfo.frameEffects = [];
    aniInfo.frameIndxs = []
    aniInfo.images = [];
    aniInfo.pivot = <Point>{};

    let atlasInfo: AtlasInfo = JSON.parse(fs.readFileSync(atlasPath, { encoding: 'UTF-8' }));
    //分拆图集，将图片从图集中分离处理
    let srcImg = Images(imgPath);
    //新建临时目录，存放分拆后的图集
    let tmp = path.join(ENV_PATH.TEMP_PATH, 'ae', aniName);
    if (!fs.existsSync(tmp))
        utils.mkdirsSync(tmp)

    let indx: number = 0;
    let pivotx: number = 0, pivoty: number = 0;
    for (let index in atlasInfo.frames) {
        let frame = atlasInfo.frames[index];
        if (!frame.ani) {
            frame.ani = <FrameEffect>{ isEffect: false, isHit: false, hitType: 0, offsetX: 0, offsetY: 0, layLevel: 0, copyIndex: indx, indxId: indx }
        } else {
            frame.ani.indxId = indx;
        }

        let frameIndx = frame.ani.copyIndex;
        //当前帧未生成图片
        if (!aniInfo.images[frameIndx]) {
            pivotx = Number(frame.sourceSize.w) >> 1;
            pivoty = Number(frame.sourceSize.h) >> 1;
            var dst = Images(frame.sourceSize.w, frame.sourceSize.h);
            var rect = frame.frame;
            var dstImgPath = path.join(tmp, ('00' + frameIndx).slice(-3) + '.png');
            dst.draw(Images(srcImg, rect.x, rect.y, rect.w, rect.h), frame.spriteSourceSize.x, frame.spriteSourceSize.y)
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
        aniDict.set(aniName, aniInfo);
        sender.send('drag-ani', aniInfo);
    } else {
        sender.send('global-error', `${aniName}.atlas 图集解析失败`);
    }
}