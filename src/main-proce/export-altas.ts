import fs from "fs";
import path from "path";
import childProcess from 'child_process';
import { utils } from "./utils";

//导出AE
exports.exportAtlas = (sender: Electron.IpcMainEvent, aniName: string, frames: string[], framesData: FrameData[], outputpath: string) => {
    let tempFolder = path.join(APP_PATH.TEMP_PATH, 'atlas');
    let tmpAtlasFolder = path.join(tempFolder, aniName);
    outputpath = path.join(outputpath, 'out');
    if (!fs.existsSync(outputpath)) {
        fs.mkdirSync(outputpath);
    }
    utils.mkdirsSync(tmpAtlasFolder);
    copyFile(frames, tmpAtlasFolder);

    let cmd = `"${APP_PATH.ROOT_PATH}/libs/TP/atlas-generator" -S 2048 -s 2048 ${tempFolder} -o ${outputpath} --dataFormat atlas --scale 1 --force -c`;

    childProcess.exec(
        cmd,
        {
            encoding: "binary",
            maxBuffer: 1024 * 1024 * 20
        },
        (err, stdOut, stdErr) => {
            utils.rmdirsSync(tempFolder);
            if (err) {
                sender.send('save-atlas-fail', err);
            } else {
                mergeAtlasConf(outputpath, aniName, framesData)
                sender.send('save-atlas-succ', aniName, outputpath);
            }
        }
    )
}

function mergeAtlasConf(dirname: string, aniName: string, framesData: FrameData[]) {
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
    let result: FrameData = <FrameData>{};// = { };
    let resultFrames: FrameData[] = [];
    result.pivot = { x: pivot_x, y: pivot_y };
    result.meta = atlasmeta;
    result.frames = resultFrames;
    for (let i = 0; i < framesData.length; i++) {
        let frameData = framesData[i];
        resultFrames[i] = JSON.parse(JSON.stringify(atlasframes[frameData.copyIndex]));

        resultFrames[i].spriteSourceSize.x = Number(resultFrames[i].spriteSourceSize.x) - lmin;
        resultFrames[i].spriteSourceSize.y = Number(resultFrames[i].spriteSourceSize.y) - tmin;

        resultFrames[i].sourceSize = { h: mHight, w: mWidth };
        resultFrames[i].ani = frameData;
    }

    fs.writeFileSync(filePath, JSON.stringify(result));

}


function copyFile(frames: string[], tempFolder: string) {
    for (let i = 0; i < frames.length; i++) {
        let frame = frames[i];
        if (frame != "" && fs.existsSync(frame)) {
            let fileName = path.basename(frame);
            fs.copyFileSync(frame, path.join(tempFolder, fileName));
        }
    }
}
