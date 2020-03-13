import fs from "fs";
import path from "path";
import childProcess from 'child_process';
import { utils } from "./utils";
import { ENV_PATH } from "./main-dao"
import { WebContents } from "electron";

//导出AE
export let exportAtlas = (sender: WebContents, aniName: string, images: string[], frameEffects: FrameEffect[], outputpath: string) => {
    let tempFolder = path.join(ENV_PATH.TEMP_PATH, 'atlas');
    let tmpAtlasFolder = path.join(tempFolder, aniName);
    outputpath = path.join(outputpath, 'out');
    if (!fs.existsSync(outputpath)) {
        fs.mkdirSync(outputpath);
    }
    utils.mkdirsSync(tmpAtlasFolder);
    copyFile(images, tmpAtlasFolder);

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
                mergeAtlasConf(outputpath, aniName, frameEffects)
                sender.send('save-atlas-succ', aniName, outputpath);
            }
        }
    )
}

function mergeAtlasConf(dirname: string, aniName: string, frameEffects: FrameEffect[]) {
    //读取原始的atlas配置
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

        if (hmax < h) {
            hmax = h;
        }
        atlasframes.push(frame);
    }
    let mWidth = rmax - lmin;
    let mHight = hmax;

    //合并atlas配置和帧信息
    let atlasInfo: AtlasInfo = <AtlasInfo>{};// = { };
    let frameDatas: FrameData[] = [];
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

    fs.writeFileSync(filePath, JSON.stringify(atlasInfo));

}


function copyFile(images: string[], tempFolder: string) {
    for (let i = 0; i < images.length; i++) {
        let image = images[i];
        if (image != "" && fs.existsSync(image)) {
            let fileName = path.basename(image);
            fs.copyFileSync(image, path.join(tempFolder, fileName));
        }
    }
}
