import fs from 'fs';
import Images from 'images';
import path from 'path';
import { WebContents } from 'electron';
import { aniDict, ENV_PATH } from './main-dao';
import { utils } from './utils';

/** 分析拖拽的文件 */
export let analyzeDragFile = (sender: WebContents, dirname: string) => {
    let stat = fs.lstatSync(dirname);
    let aniInfo: AniInfo;
    //如果是图集
    if (stat.isFile()) {
        aniInfo = analyzeAtlasFile(sender, dirname);
    } else {
        aniInfo = analyzeDirectory(sender, dirname);
    }
    if (aniInfo)
        sender.send('drag-ani', aniInfo);
}

//如果拖拽的是文件夹，未打包的圖片集合
let analyzeDirectory = (sender: WebContents, rootPath: string): AniInfo => {
    var aniName = path.basename(rootPath);
    if (aniDict.get(aniName)) {
        sender.send('ae-error', '列表中存在相同的动画:' + aniName);
        return null;
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
                aniInfo.frameEffects.push({ isEffect: 0, hitXY: [], offset: [0, 0], fireXY: [], layLevel: 0, copyIndex: indx, indxId: indx, isBlank: false, lblName: "" });
                indx++;
                aniInfo.pivot.x = Images(filePath).size().width >> 1;
                aniInfo.pivot.y = Images(filePath).size().height >> 1;
                aniInfo.pivotIsDefaut = true;
            }
        }
    })
    if (aniInfo.images.length > 0) {
        aniDict.set(aniName, aniInfo);
        return aniInfo;
    } else {
        sender.send('global-error', `${aniName} 资源目录解析失败`);
        return null;
    }
}

//如果拖拽的是图集
export let analyzeAtlasFile = (sender: WebContents, atlasPath: string, isTest: boolean = false): AniInfo => {
    let extname = path.extname(atlasPath)
    let aniName = path.basename(atlasPath, extname)
    if (aniDict.get(aniName) && !isTest) {
        sender.send('global-error', `${aniName} 动画已存在`);
        return null;
    }
    if (extname != '.atlas') {
        //拖拽是文件，不解析
        sender.send('global-error', '请拖拽存放【序列图文件夹】或者 【图集.atlas】文件');
        return null;
    }

    var imgPath = atlasPath.replace(".atlas", ".png");
    if (!fs.existsSync(imgPath)) {
        sender.send('global-error', `找不到 ${aniName}.atlas 对于的图集图片`);
        return null;
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
    let imgCheck: any = {};
    let imgIndx = 0;
    for (let index in atlasInfo.frames) {
        let frame = atlasInfo.frames[index];
        if (!frame.ani) {
            frame.ani = { isEffect: 0, hitXY: [], offset: [0, 0], fireXY: [], layLevel: 0, copyIndex: indx, indxId: indx, isBlank: false, lblName: "" }
        } else {
            if ('isHit' in (<any>frame.ani)) {
                if ((<any>frame.ani)['isHit'])
                    frame.ani.hitXY = [0, 0];
                else
                    frame.ani.hitXY = [];
                delete (<any>frame.ani)['isHit'];
            }
            if ('hitType' in (<any>frame.ani)) {
                delete (<any>frame.ani)['hitType'];
            }
            if ('offsetX' in (<any>frame.ani)) {
                frame.ani.offset = [(<any>frame.ani)['offsetX'], (<any>frame.ani)['offsetY']];
                delete (<any>frame.ani)['offsetX'];
                delete (<any>frame.ani)['offsetY'];
            }
            if (!('fireXY' in (<any>frame.ani))) {
                frame.ani.fireXY = [];
            }
            if (frame.ani.isEffect) frame.ani.isEffect = 1;
            else frame.ani.isEffect = 0;
            if (frame.ani.offset.length == 0)
                frame.ani.offset = [0, 0];
            if (!('lblName' in (<any>frame.ani))) {
                frame.ani.lblName = "";
            }
            frame.ani.indxId = indx;
        }

        var rect = frame.frame;
        let rectStr = [rect.x, rect.y, rect.w, rect.h, frame.spriteSourceSize.x, frame.spriteSourceSize.y].join(',');
        if (isNaN(imgCheck[rectStr])) {
            imgCheck[rectStr] = imgIndx;
            imgIndx++;
        }
        let frameIndx = imgCheck[rectStr]
        //当前帧未生成图片
        if (!aniInfo.images[frameIndx] && !frame.ani.isBlank) {
            pivotx = Number(frame.sourceSize.w) >> 1;
            pivoty = Number(frame.sourceSize.h) >> 1;
            var dst = Images(frame.sourceSize.w, frame.sourceSize.h);
            var dstImgPath = path.join(tmp, ('00' + frameIndx).slice(-3) + '.png');
            dst.draw(Images(srcImg, rect.x, rect.y, rect.w, rect.h), frame.spriteSourceSize.x, frame.spriteSourceSize.y)
                .save(dstImgPath);
            aniInfo.images[frameIndx] = dstImgPath;
        }
        frame.ani.copyIndex = frameIndx;
        frame.ani.indxId = indx;
        indx++;
        aniInfo.frameEffects.push(frame.ani);
        aniInfo.frameIndxs.push(frameIndx);
    }
    if (atlasInfo.pivot) {
        aniInfo.pivot = atlasInfo.pivot;
        aniInfo.pivotIsDefaut = false;
    } else {
        aniInfo.pivot = { x: pivotx, y: pivoty };
        aniInfo.pivotIsDefaut = true;
    }

    if (aniInfo.images.length > 0) {
        if (!isTest) aniDict.set(aniName, aniInfo);
        return aniInfo;
    } else {
        sender.send('global-error', `${aniName}.atlas 图集解析失败`);
        return null;
    }
}