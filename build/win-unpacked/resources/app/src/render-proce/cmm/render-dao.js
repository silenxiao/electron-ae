"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalDao = {
    coordinateX: 0,
    coordinateY: 0,
    curAniName: '',
    curFrameIndex: 0,
    frameDrag: true,
    showSelected: true,
    isCopyFrame: false
};
/**通用的动画配置 */
exports.cmmAniConf = new Map();
exports.aniEntityDict = new Map();
exports.frameCopy = {
    isCopyFrame: false,
    copyAniName: '',
    copyFrameIndex: 0,
};
exports.confParam = {
    frameRate: 30,
    bgParam: {
        url: 'scene.jpg',
        posX: 110,
        posY: -30,
        coordinateX: 430,
        coordinateY: 515
    },
    frameIntev: {
        idle_s: 6,
        atk1_s: 1,
        die_s: 3,
        hit_s: 4,
        run_s: 2
    }
};
