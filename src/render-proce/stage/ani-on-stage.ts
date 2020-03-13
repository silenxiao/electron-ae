import AniEntity from "../cmm/AniEntity";
import { globalDao } from "../cmm/render-dao";
import StagePanel from "./StagePanel";

/**
 * 主舞台控制类，控制主舞台实体显示
 */

let container: Laya.Panel;

let showList: Map<string, AniEntity>;
export function aniToStageHandle(view: StagePanel) {
    showList = view.showList;
    container = view.container;
}

/**
 * 交换动画的层级
 * @param {*} srcAniName 
 * @param {*} dstAniName 
 */
export function switchAniOnStage(srcAniName: string, dstAniName: string) {
    let srcIndex = container.getChildIndex(showList.get(srcAniName));
    let dstIndex = container.getChildIndex(showList.get(dstAniName));
    container.addChildAt(showList.get(srcAniName), dstIndex);
    container.addChildAt(showList.get(dstAniName), srcIndex);
}

/**
 * 设置所有动画当前帧
 * @param {帧数} frameIndex 
 */
export function setAllAniFrameIndex(index: number) {
    showList.forEach((val) => {
        val.setTexture(index);
    })
}

/**
 * 同步坐标轴
 */
export function syncAniCoord(val: number) {
    if (val == 0) {
        showList.forEach(val => {
            val.pos(globalDao.coordinateX, globalDao.coordinateY);
        })
    } else if (showList.has(globalDao.curAniName)) {
        showList.get(globalDao.curAniName).pos(globalDao.coordinateX, globalDao.coordinateY);
    }
}

/**
 * 修改动画在舞台的显示层级
 * @param val 
 */
export function changeAniLayoutOnStage(val: number) {
    let aniName = globalDao.curAniName;
    if (!showList.has(name)) return;
    let index = container.getChildIndex(showList.get(aniName))
    index += val;
    if (index < 1) index = 1;
    if (index >= container.numChildren) index = container.numChildren;
    container.addChildAt(showList.get(aniName), index)
}