import fs from "fs";
import path from "path";
import childProcess from 'child_process';
import { utils } from "./utils";
import { ENV_PATH, aniDict, globalParam } from "./main-dao"
import { WebContents } from "electron";
import tinify from 'tinify'

//导出AE
export let exportAtlas = (sender: WebContents, aniName: string, images: string[], frameEffects: FrameEffect[], outputpath: string) => {
    let tempFolder = path.join(ENV_PATH.TEMP_PATH, 'atlas');
    let tmpAtlasFolder = path.join(tempFolder, aniName);
    outputpath = path.join(outputpath, 'out');
    if (!fs.existsSync(outputpath)) {
        fs.mkdirSync(outputpath);
    }
    utils.mkdirsSync(tmpAtlasFolder);
    let indexToPng = copyFile(frameEffects, images, tmpAtlasFolder);

    let cmd = `"${ENV_PATH.ROOT_PATH}/libs/TP/atlas-generator" -S 2048 -s 2048 ${tempFolder} -o ${outputpath} --dataFormat atlas --scale 1 --force -c`;

    childProcess.exec(
        cmd,
        {
            encoding: "binary",
            maxBuffer: 1024 * 1024 * 20
        },
        (err, stdOut, stdErr) => {
            utils.rmdirsSync(tempFolder);
            if (err) {
                sender.send('global-error', err.message);
            } else {
                //压缩图片
                //tinify.key = globalParam.tinify_key;

                //let filePath = path.join(outputpath, `${aniName}.png`);
                //const source = tinify.fromFile(filePath);
                //source.toFile(filePath);
                mergeAtlasConf(outputpath, aniName, frameEffects, indexToPng)
                sender.send('save-atlas-succ', aniName, outputpath);
            }
        }
    )
}

function mergeAtlasConf(dirname: string, aniName: string, frameEffects: FrameEffect[], indexToPng: number[]) {
    //读取原始的atlas配置
    let aniInfo = aniDict.get(aniName);
    let filePath = path.join(dirname, `${aniName}.atlas`);
    let atlasJson = JSON.parse(fs.readFileSync(filePath, { encoding: 'UTF-8' }));
    let atlasframes = [];
    let atlasmeta = atlasJson.meta;
    let lmin = 2048;
    let tmin = 2048
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
        if (rmax < x + w) rmax = x + w;
        if (tmin > y) {
            tmin = y;
            pivot_y = sourceSizeH - y;
        }

        if (hmax < h + y) {
            hmax = h + y;
        }
        atlasframes.push(frame);
    }
    let mWidth = rmax - lmin;
    let mHight = hmax - tmin;

    //合并atlas配置和帧信息
    let atlasInfo: AtlasInfo = <AtlasInfo>{};// = { };
    let frameDatas: FrameData[] = [];
    if (aniInfo.pivotIsDefaut)
        atlasInfo.pivot = { x: pivot_x, y: pivot_y };
    else
        atlasInfo.pivot = aniInfo.pivot;
    atlasInfo.meta = atlasmeta;
    atlasInfo.frames = frameDatas;
    for (let i = 0; i < frameEffects.length; i++) {
        let frameEffect = frameEffects[i];
        if (frameEffect.isBlank) {
            frameDatas[i] = genBlankFrame(mWidth, mHight, frameEffect);
        } else {
            frameDatas[i] = JSON.parse(JSON.stringify(atlasframes[indexToPng[frameEffect.copyIndex]]));

            frameDatas[i].spriteSourceSize.x = Number(frameDatas[i].spriteSourceSize.x) - lmin;
            frameDatas[i].spriteSourceSize.y = Number(frameDatas[i].spriteSourceSize.y) - tmin;

            frameDatas[i].sourceSize = { h: mHight, w: mWidth };
            frameEffect.copyIndex = indexToPng[frameEffect.copyIndex];
            frameDatas[i].ani = frameEffect;
        }
        frameDatas[i].frame.id = frameEffect['copyIndex'];
        let lastFrame = frameEffects[i - 1];
        if (frameEffect.offset[0] == 0 && frameEffect.offset[1] == 0)
            if (lastFrame && (lastFrame.offset.length > 0 && (lastFrame.offset[0] != 0 || lastFrame.offset[1] != 0)))
                frameEffect.offset = [0, 0];
            else
                frameEffect.offset = [];
        delete frameEffect['isBlank'];
        delete frameEffect['copyIndex'];
        delete frameEffect['indxId'];

        if (!checkFrameExsitEffect(frameEffect)) {
            delete frameDatas[i].ani
        }
    }
    fs.writeFileSync(filePath, JSON.stringify(atlasInfo));
}

/** 检查帧效果是否存在修改的数据 */
function checkFrameExsitEffect(frameEffect: FrameEffect): boolean {
    if (frameEffect.hitXY.length > 0)
        return true;
    if (frameEffect.isEffect == 1)
        return true;
    if (frameEffect.layLevel > 0)
        return true;
    if (frameEffect.lblName != '')
        return true;
    if (frameEffect.offset.length > 0)
        return true;
    if (frameEffect.fireXY.length > 0)
        return true;
    return false;
}

function copyFile(frameEffects: FrameEffect[], images: string[], tempFolder: string): number[] {
    let isBlankInxs = [];
    let indexToPng: number[] = [];
    for (let frameEffect of frameEffects) {
        if (frameEffect.isBlank) isBlankInxs.push(frameEffect.copyIndex);
    }
    let pngIndex = 0;
    for (let i = 0; i < images.length; i++) {
        if (isBlankInxs.indexOf(i) >= 0) continue;
        let image = images[i];
        if (image != "" && fs.existsSync(image)) {
            fs.copyFileSync(image, path.join(tempFolder, ('00' + pngIndex).slice(-3) + '.png'));
            indexToPng[i] = pngIndex;
            pngIndex++;
        }
    }
    return indexToPng;
}

function genBlankFrame(mWidth: number, mHight: number, frameEffect: FrameEffect) {
    let blankFrame = <FrameData>{};
    let frame = { h: 1, idx: 0, w: 1, x: 0, y: 0, id: 0 };
    let sourceSize = { h: mHight, w: mWidth };
    let spriteSourceSize = { x: 0, y: 0 };
    blankFrame.frame = frame;
    blankFrame.sourceSize = sourceSize;
    blankFrame.spriteSourceSize = spriteSourceSize;
    frameEffect.copyIndex = -1;
    blankFrame.ani = frameEffect;
    return blankFrame;
}