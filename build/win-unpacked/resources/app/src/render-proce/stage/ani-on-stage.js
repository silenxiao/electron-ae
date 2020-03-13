"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const render_dao_1 = require("../cmm/render-dao");
/**
 * 主舞台控制类，控制主舞台实体显示
 */
let container;
let showList;
function aniToStageHandle(view) {
    showList = view.showList;
    container = view.container;
}
exports.aniToStageHandle = aniToStageHandle;
/**
 * 交换动画的层级
 * @param {*} srcAniName
 * @param {*} dstAniName
 */
function switchAniOnStage(srcAniName, dstAniName) {
    let srcIndex = container.getChildIndex(showList.get(srcAniName));
    let dstIndex = container.getChildIndex(showList.get(dstAniName));
    container.addChildAt(showList.get(srcAniName), dstIndex);
    container.addChildAt(showList.get(dstAniName), srcIndex);
}
exports.switchAniOnStage = switchAniOnStage;
/**
 * 设置所有动画当前帧
 * @param {帧数} frameIndex
 */
function setAllAniFrameIndex(index) {
    showList.forEach((val) => {
        val.setTexture(index);
    });
}
exports.setAllAniFrameIndex = setAllAniFrameIndex;
/**
 * 同步坐标轴
 */
function syncAniCoord(val) {
    if (val == 0) {
        showList.forEach(val => {
            val.pos(render_dao_1.globalDao.coordinateX, render_dao_1.globalDao.coordinateY);
        });
    }
    else if (showList.has(render_dao_1.globalDao.curAniName)) {
        showList.get(render_dao_1.globalDao.curAniName).pos(render_dao_1.globalDao.coordinateX, render_dao_1.globalDao.coordinateY);
    }
}
exports.syncAniCoord = syncAniCoord;
/**
 * 修改动画在舞台的显示层级
 * @param val
 */
function changeAniLayoutOnStage(val) {
    let aniName = render_dao_1.globalDao.curAniName;
    if (!showList.has(name))
        return;
    let index = container.getChildIndex(showList.get(aniName));
    index += val;
    if (index < 1)
        index = 1;
    if (index >= container.numChildren)
        index = container.numChildren;
    container.addChildAt(showList.get(aniName), index);
}
exports.changeAniLayoutOnStage = changeAniLayoutOnStage;
