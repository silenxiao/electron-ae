import AniEntity from "../cmm/AniEntity";
import { globalDao, frameCopy, aniEntityDict } from "../cmm/render-dao";
import FramePanel from "./FramePanel";
import ActAniNameRender from "./ActAniNameRender";
import { switchAniOnStage } from "../stage/ani-on-stage";
import { EvtCenter, AE_Event } from "../cmm/EvtCenter";
/**
 * 帧动画调整
 */
let listActAni: Laya.List;
let listAniName: Laya.List;
let dataList: string[] = [];
let cursor: Laya.Panel;
let renderList: ActAniNameRender[];


export function aniFrameEdit(editor: FramePanel) {
    listActAni = editor.listActAni;
    dataList = editor.dataList;
    cursor = editor.cursor;
    cursor.x = 4;
    renderList = editor.nameRenderList;
    listAniName = editor.listAniName;
}

export function setCurFrameIndex(index: number, curAniEnity: AniEntity) {
    globalDao.curFrameIndex = index;
    cursor.x = 4 + 20 * index;
    curAniEnity && curAniEnity.sysFrameDataToPanel();
}

/**
 * 删除当前帧
 */
export function delCurFrame(curAniEnity: AniEntity) {
    if (curAniEnity == null) return;
    let index = dataList.indexOf(curAniEnity.aniInfo.aniName);
    curAniEnity.delCurFrame();
    //更新帧面板数据
    listActAni.changeItem(index, curAniEnity.aniInfo.aniName);
}

//复制帧
export function copyFrame(curAniEnity: AniEntity) {
    if (curAniEnity == null) return;

    let index = dataList.indexOf(curAniEnity.aniInfo.aniName);
    //复制一帧
    if (frameCopy.beginIdx == frameCopy.endIdx) {
        //增加一帧
        if (globalDao.curFrameIndex == frameCopy.beginIdx) {
            curAniEnity.insertFrame(globalDao.curFrameIndex);
            listActAni.changeItem(index, curAniEnity.aniInfo.aniName);
        } else {
            //覆盖当前帧
            curAniEnity.rewriteCurFrame(frameCopy.beginIdx);
            listActAni.changeItem(index, curAniEnity.aniInfo.aniName);
        }
    } else {
        curAniEnity.insertRangeFrame(frameCopy.beginIdx, frameCopy.endIdx);
        listActAni.changeItem(index, curAniEnity.aniInfo.aniName);
    }
}

export function updateFramePanelData(aniName: string) {
    let index = dataList.indexOf(aniName);
    if (index >= 0)
        listActAni.changeItem(index, aniName);
}

/**
 * 修改动画在帧控制面板的层级
 * @param val 
 */
export function changeAniLayoutOnFrame(val: number) {
    let index = dataList.indexOf(globalDao.curAniName);
    if (index < 0) return;
    if (val == -1 && index == 0) return;
    if (val == 1 && index == dataList.length - 1) return;
    switchCell(renderList[index], renderList[index + val])
}

export function switchCell(srcCell: ActAniNameRender, dstCell: ActAniNameRender) {
    let dstIndex = dstCell.renderIndex;
    let srcIndex = srcCell.renderIndex;
    dataList[dstIndex] = srcCell.dataSource;
    dataList[srcIndex] = dstCell.dataSource;
    switchAniOnStage(srcCell.dataSource, dstCell.dataSource);
    listAniName.refresh();
    listActAni.refresh();
    if (listAniName.selectedIndex == dstIndex)
        EvtCenter.send(AE_Event.ANI_SELECTED, dataList[dstIndex]);
    else
        listAniName.selectedIndex = dstIndex;
}