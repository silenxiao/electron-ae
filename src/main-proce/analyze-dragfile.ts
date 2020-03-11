import fs from 'fs';
import Images from 'images';
import path from 'path';

export let analyzeDragFile = (dirname) => {
    let stat = fs.lstatSync(rootpath);
    var aniName = path.basename(rootpath);
    if (stat.isFile()) {
        var extname = path.extname(rootpath);
        aniName = aniName.substr(0, aniName.length - extname.length)
        var args = analyzeAniFile(rootpath, aniName, extname);
    } else {
        var args = analyzeAniDirectory(rootpath, aniName);
    }
}
export module analyzeDragFle {
    //如果拖拽的是文件夹，未打包的圖片集合
    export let analyzeAniDirectory = (rootPath, aniName) => {
        if (aniDict[aniName]) {
            return [1, '列表中存在相同的动画:' + aniName];
        }
        let aniInfo = { name: aniName, filePath: '', framesData: [], frames: [], imgs: {}, pivot: { x: 0, y: 0 } };
        //解析序列图
        let result = analyzeAniFrame(aniInfo, rootPath);
        if (result)
            return [0, aniInfo];
        else {
            return [1, '资源目录解析失败'];
        }
    }

    //如果拖拽的是图集
    export let analyzeAniFile = (rootPath, aniName, extname) => {
        if (aniDict[aniName]) {
            return [1, '列表中存在相同的动画:' + aniName];
        }
        if (extname == ".atlas") {
            var imgPath = rootPath.replace(".atlas", ".png");
            if (fs.existsSync(imgPath)) {
                let aniInfo = { name: aniName, filePath: '', framesData: [], frames: [], imgs: {}, pivot: { x: 0, y: 0 } };
                let ret = analyzeAniAtlas(aniInfo, rootPath, imgPath);
                if (ret) {
                    return [0, aniInfo];
                } else {
                    return [1, aniName + '图集解析失败'];
                }
            }
            else {
                return [1, '找不到' + aniName + ".atlas 对于的图集图片"];
            }
        } else {
            //拖拽是文件，不解析
            return [1, '请拖拽存放【序列图文件夹】或者 【图集.atlas】文件]'];
        }
    }


    //分析序列图动画
    function analyzeAniFrame(aniInfo, rootPath) {
        let frames = [];
        let imgs = {};
        var files = fs.readdirSync(rootPath);
        let index = 0;
        files.forEach((fileName, _index) => {
            let filePath = rootPath + "/" + fileName;
            var info = fs.statSync(filePath)
            //行为目录下只分析文件
            if (!info.isDirectory()) {
                var extname = path.extname(fileName);
                if (extname == ".jpg" || extname == ".png") {
                    frames.push(filePath);
                    imgs[index] = filePath;
                    aniInfo.framesData.push({ isEffect: false, isHit: false, hitType: 0, offsetX: 0, offsetY: 0, layLevel: 0, copyIndex: index, frameId: index });
                    index++;
                    aniInfo.pivot.x = Images(filePath).size().width >> 1;
                    aniInfo.pivot.y = Images(filePath).size().height >> 1;
                }
            }
        })
        aniInfo.filePath = rootPath;
        aniInfo.frames = frames;
        aniInfo.imgs = imgs;
        if (frames.length > 0) return true;
        else return false;
    }

    //分析图集
    function analyzeAniAtlas(aniInfo, atlasPath, imgPath) {
        let atlasInfo = JSON.parse(fs.readFileSync(atlasPath));
        //分拆图集，将图片从图集中分离处理
        let srcImg = Images(imgPath);
        //新建临时目录
        let tmp = path.join(APP_PATH.TEMP_PATH, 'ae', aniInfo.name);
        if (!fs.existsSync(tmp))
            mkdirsSync(tmp)
        let frames = atlasInfo.frames;
        let pivotx;
        let pivoty;
        let imgs = {};
        let id = 0;
        for (let index in frames) {
            let frame = frames[index];
            if (!frame.ani) {
                frame.ani = { isEffect: false, isHit: false, hitType: 0, offsetX: 0, offsetY: 0, layLevel: 0, copyIndex: id }
            }
            let frameIndex = frame.ani.copyIndex;
            //当前帧未生成图片
            if (!imgs[frameIndex]) {
                pivotx = Number(frame.sourceSize.w) >> 1;
                pivoty = Number(frame.sourceSize.h) >> 1;
                var dst = Images(frame.sourceSize.w, frame.sourceSize.h);
                var rect = frame.frame;
                var dstImgPath = path.join(tmp, ('00' + frameIndex).slice(-3) + '.png');
                dst.draw(Images(srcImg, rect.x, rect.y, rect.w, rect.h), frame.spriteSourceSize.x, frame.spriteSourceSize.y)
                    .save(dstImgPath);
                imgs[frameIndex] = dstImgPath;
            }
            frame.ani.frameId = id;
            id++;
            aniInfo.framesData.push(frame.ani);
            aniInfo.frames.push(dstImgPath);
        }
        aniInfo.filePath = path.dirname(imgPath);
        if (atlasInfo.pivot)
            aniInfo.pivot = atlasInfo.pivot;
        else
            aniInfo.pivot = { x: pivotx, y: pivoty };
        if (aniInfo.frames.length > 0) return true;
        else return false;
    }
}