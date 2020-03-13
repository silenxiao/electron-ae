"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const render_dao_1 = require("../cmm/render-dao");
const ani_on_stage_1 = require("../stage/ani-on-stage");
const EvtCenter_1 = require("../cmm/EvtCenter");
/**
 * 帧动画调整
 */
let listActAni;
let listAniName;
let dataList = [];
let cursor;
let renderList;
function aniFrameEdit(editor) {
    listActAni = editor.listActAni;
    dataList = editor.dataList;
    cursor = editor.cursor;
    cursor.x = 4;
    renderList = editor.renderList;
    listAniName = editor.listAniName;
}
exports.aniFrameEdit = aniFrameEdit;
function setCurFrameIndex(index, curAniEnity) {
    render_dao_1.globalDao.curFrameIndex = index;
    cursor.x = 4 + 20 * index;
    curAniEnity && curAniEnity.sysFrameDataToPanel();
}
exports.setCurFrameIndex = setCurFrameIndex;
/**
 * 删除当前帧
 */
function delCurFrame(curAniEnity) {
    if (curAniEnity == null)
        return;
    let index = dataList.indexOf(curAniEnity.aniInfo.aniName);
    curAniEnity.delCurFrame();
    //更新帧面板数据
    listActAni.changeItem(index, curAniEnity.aniInfo.aniName);
}
exports.delCurFrame = delCurFrame;
//复制帧
function copyFrame(curAniEnity) {
    if (curAniEnity == null)
        return;
    let index = dataList.indexOf(curAniEnity.aniInfo.aniName);
    //增加一帧
    if (render_dao_1.globalDao.curFrameIndex == render_dao_1.frameCopy.copyFrameIndex) {
        curAniEnity.insertFrame();
        listActAni.changeItem(index, curAniEnity.aniInfo.aniName);
    }
    else {
        //覆盖当前帧
        curAniEnity.rewriteCurFrame(render_dao_1.frameCopy.copyFrameIndex);
        listActAni.changeItem(index, curAniEnity.aniInfo.aniName);
    }
}
exports.copyFrame = copyFrame;
function updateFramePanelData(aniName) {
    let index = dataList.indexOf(aniName);
    if (index >= 0)
        listActAni.changeItem(index, aniName);
}
exports.updateFramePanelData = updateFramePanelData;
/**
 * 修改动画在帧控制面板的层级
 * @param val
 */
function changeAniLayoutOnFrame(val) {
    let index = dataList.indexOf(render_dao_1.globalDao.curAniName);
    if (index < 0)
        return;
    if (val == -1 && index == 0)
        return;
    if (val == 1 && index == dataList.length - 1)
        return;
    switchCell(renderList[index], renderList[index + val]);
}
exports.changeAniLayoutOnFrame = changeAniLayoutOnFrame;
function switchCell(srcCell, dstCell) {
    let dstIndex = dstCell.renderIndex;
    let srcIndex = srcCell.renderIndex;
    dataList[dstIndex] = srcCell.dataSource;
    dataList[srcIndex] = dstCell.dataSource;
    ani_on_stage_1.switchAniOnStage(srcCell.dataSource, dstCell.dataSource);
    listAniName.refresh();
    listActAni.refresh();
    if (listAniName.selectedIndex == dstIndex)
        EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_SELECTED, dataList[dstIndex]);
    else
        listAniName.selectedIndex = dstIndex;
}
exports.switchCell = switchCell;
