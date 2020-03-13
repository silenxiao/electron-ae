"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const images_1 = __importDefault(require("images"));
// 递归创建目录 同步方法
var utils;
(function (utils) {
    utils.mkdirsSync = (dirname) => {
        if (fs_1.default.existsSync(dirname)) {
            return true;
        }
        else {
            if (utils.mkdirsSync(path_1.default.dirname(dirname))) {
                fs_1.default.mkdirSync(dirname);
                return true;
            }
        }
    };
    //递归删除目录
    utils.rmdirsSync = (dirname) => {
        let files = [];
        if (fs_1.default.existsSync(dirname)) {
            files = fs_1.default.readdirSync(dirname);
            files.forEach((file, index) => {
                var curPath = path_1.default.join(dirname, file);
                if (fs_1.default.statSync(curPath).isDirectory()) {
                    utils.rmdirsSync(curPath);
                }
                else {
                    fs_1.default.unlinkSync(curPath);
                }
            });
            fs_1.default.rmdirSync(dirname);
        }
    };
    //保存 图片
    utils.saveAEImg = (dstPath, imgIndex, pivot, srcPath, x, y) => {
        var dst = images_1.default(1024, 1024);
        var dstPath = path_1.default.join(dstPath, ('00' + imgIndex).slice(-3) + '.png');
        dst.draw(images_1.default(srcPath), x + 512 - pivot.x, y + 512 - pivot.y).save(dstPath);
    };
})(utils = exports.utils || (exports.utils = {}));
