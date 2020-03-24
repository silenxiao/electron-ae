import path from 'path';
import fs from 'fs';
import Images from 'images';


// 递归创建目录 同步方法
export module utils {
    export let mkdirsSync = (dirname: string) => {
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
    }
    //递归删除目录
    export let rmdirsSync = (dirname: string) => {
        let files = [];
        if (fs.existsSync(dirname)) {
            files = fs.readdirSync(dirname);
            files.forEach((file, index) => {
                var curPath = path.join(dirname, file);
                if (fs.statSync(curPath).isDirectory()) {
                    rmdirsSync(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(dirname);
        }
    }

    //保存 图片
    export let saveAEImg = (dstPath: string, imgIndex: number, pivot: Point, srcPath: string, x: number, y: number) => {
        var dst = Images(1024, 1024);
        var dstPath = path.join(dstPath, ('00' + imgIndex).slice(-3) + '.png');
        var srcImg;
        if (srcPath == '')
            srcImg = Images(srcPath);
        else
            srcImg = Images(2, 2);
        dst.draw(srcImg, x + 512 - pivot.x, y + 512 - pivot.y).save(dstPath);
    }
}