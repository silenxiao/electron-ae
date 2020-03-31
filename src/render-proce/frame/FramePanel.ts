import { EvtCenter, AE_Event, ANI_FRAME_TYPE } from "../cmm/EvtCenter";
import AniEntity from "../cmm/AniEntity";
import ActAniNameRender from "./ActAniNameRender";
import { globalDao, aniEntityDict } from "../cmm/render-dao";
import { aniFrameEdit, switchCell, updateFramePanelData } from "./ani-frame-edit";
import { ui } from "../../ui/layaMaxUI";
import ActAniRender from "./ActFrameListRender";
import { setTxtCurAniName } from "../attr/ani-save";

export default class FramePanel extends ui.scene.FramePanelUI {
    dataList: string[] = [];
    curAniEnity: AniEntity;
    dragItem: ActAniNameRender;
    aniSelectedIndex: number = 0;
    nameRenderList: ActAniNameRender[] = [];
    aniRenderList: ActAniRender[] = [];
    lastPosY: number;
    lastPosX: number;
    constructor() {
        super();
    }

    onEnable() {
        this.frameListPanel.hScrollBar.visible = false;
        this.btnFrameReset.on(Laya.Event.CLICK, this, this.onFrameReset);
        this.btnFrameSave.on(Laya.Event.CLICK, this, this.onFrameSave);
        this.btnBlank.on(Laya.Event.CLICK, this, this.onBtnBlackClick);
        this.btnCopy.on(Laya.Event.CLICK, this, this.onBtnCopyClick);
        this.btnInsert.on(Laya.Event.CLICK, this, this.onBtnInsertClick);

        this.btnPlay.on(Laya.Event.CLICK, this, this.onBtnPlay);
        this.btnStop.on(Laya.Event.CLICK, this, this.onBtnStop);

        this.chkselect.on(Laya.Event.CHANGE, this, this.onChkSelected);
        this.chkLoop.on(Laya.Event.CHANGE, this, this.onChkLoop);


        this.listgradua.renderHandler = Laya.Handler.create(this, this.onGraduaRender, null, false);
        let arr: number[] = [];
        let i = 0;
        while (i++ < 102)
            arr.push(i);
        this.listgradua.dataSource = arr;

        this.listAniName.selectEnable = true;
        this.listAniName.renderHandler = Laya.Handler.create(this, this.onAniNameRender, null, false);
        this.listAniName.selectHandler = Laya.Handler.create(this, this.onListAniSelect, null, false);
        this.listAniName.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        this.listAniName.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        this.listAniName.on(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
        this.listAniName.dataSource = this.dataList;

        this.listActAni.selectEnable = true;
        this.listActAni.renderHandler = Laya.Handler.create(this, this.onListAniRender, null, false);
        this.listActAni.selectHandler = Laya.Handler.create(this, this.onListAniSelect, null, false);
        this.listActAni.dataSource = this.dataList;

        EvtCenter.on(AE_Event.ANI_TO_STAGE, this, this.onAddToStage);
        EvtCenter.on(AE_Event.ANI_REMOVE_STAGE, this, this.onRemoveToStage);
        EvtCenter.on(AE_Event.ANI_SELECTED, this, this.onAniSelected);
        EvtCenter.on(AE_Event.ANI_TO_PLAY, this, this.onAniToPlay);

        aniFrameEdit(this);
    }

    /* 帧数重置 */
    onFrameReset() {
        if (this.curAniEnity == null) return;
        EvtCenter.send(AE_Event.ANI_FRAME_EVENT, ANI_FRAME_TYPE.ANI_FRAMES_RESET);

        this.listActAni.changeItem(this.aniSelectedIndex, this.curAniEnity.aniInfo.aniName);
    }

    onFrameSave() {
        if (this.curAniEnity == null) return;
        EvtCenter.send(AE_Event.ANI_FRAME_EVENT, ANI_FRAME_TYPE.ANI_FRAMES_SAVE);
    }
    //插入空白帧
    onBtnBlackClick() {
        let num: number = Number(this.cbBlank.selectedLabel);
        if (this.curAniEnity == null) return;
        this.curAniEnity.addBlankFrame(num);
        this.listActAni.changeItem(this.aniSelectedIndex, this.curAniEnity.aniInfo.aniName);
    }

    //复制前一帧
    onBtnCopyClick() {
        let num: number = Number(this.cbCopy.selectedLabel);
        if (this.curAniEnity == null) return;
        this.curAniEnity.addCopyFrameNum(num);
        this.listActAni.changeItem(this.aniSelectedIndex, this.curAniEnity.aniInfo.aniName);
    }

    //当前帧后查一帧
    onBtnInsertClick() {
        if (this.curAniEnity == null) return;
        this.curAniEnity.insertFrame(globalDao.curFrameIndex);
        this.listActAni.changeItem(this.aniSelectedIndex, this.curAniEnity.aniInfo.aniName);
    }

    onAniToPlay(val: boolean) {
        globalDao.isPlay = val;
        this.btnStop.visible = val;
        this.btnPlay.visible = !val;
    }
    //动画播放
    onBtnPlay() {
        EvtCenter.send(AE_Event.ANI_TO_PLAY, true);
    }

    onBtnStop() {
        EvtCenter.send(AE_Event.ANI_TO_PLAY, false);
    }


    //显示边框
    onChkSelected() {
        globalDao.showSelected = this.chkselect.selected;
        if (this.curAniEnity == null) return;
        this.curAniEnity.showFilter();
    }
    onChkLoop() {
        globalDao.isLoopPlay = this.chkLoop.selected;
    }

    //刻度显示
    onGraduaRender(cell: Laya.Box, index: number) {
        let lblGradua: Laya.Label = cell.getChildByName('lblGradua') as Laya.Label;
        if (index % 5 == 0)
            lblGradua.text = index.toString();
        else
            lblGradua.text = '•';
    }

    onAniNameRender(cell: ActAniNameRender, index: number) {
        cell.setData(cell.dataSource, index);
        this.nameRenderList[index] = cell;
        if (this.listAniName.selectedIndex == -1) {
            this.listAniName.selectedIndex = 0;
        }
    }

    //设置帧参数
    onListAniRender(cell: ActAniRender, index: number) {
        cell.setData(cell.dataSource);
        this.aniRenderList[index] = cell;
    }

    onListAniSelect(index: number) {
        EvtCenter.send(AE_Event.ANI_SELECTED, this.dataList[index]);
    }


    onAddToStage(name: string) {
        if (this.dataList.indexOf(name) < 0) {
            this.dataList.push(name);
            this.listAniName.refresh();
            this.listActAni.refresh();
        } else {
            updateFramePanelData(name);
        }
    }

    onRemoveToStage(name: string) {
        let index = this.dataList.indexOf(name);
        if (index >= 0) {
            this.dataList.splice(index, 1);
            this.listAniName.refresh();
            this.listActAni.refresh();
        }
        if (this.dataList.length == 0) {
            EvtCenter.send(AE_Event.ANI_TO_PLAY, false);
        }
        if (globalDao.curAniName == name) {
            globalDao.curAniName = '';
            setTxtCurAniName('');
            this.curAniEnity = null;
        }
    }


    onAniSelected(aniName: string) {
        let index = this.dataList.indexOf(aniName);
        if (this.aniSelectedIndex != index) {
            this.nameRenderList[this.aniSelectedIndex].selected = false;
            this.aniRenderList[this.aniSelectedIndex].resetSelect();
            if (this.curAniEnity)
                this.curAniEnity.selected = false;
        }
        globalDao.curAniName = aniName;
        if (index >= 0) {
            this.nameRenderList[index].selected = true;
            this.aniSelectedIndex = index;
            this.curAniEnity = aniEntityDict.get(this.dataList[index]) as AniEntity;
            this.curAniEnity.selected = true;
            this.curAniEnity.sysFrameDataToPanel();
        }
        setTxtCurAniName(aniName);
    }

    /**拖拽 */
    onMouseDown(evt: Laya.Event) {
        if (evt.target instanceof ActAniNameRender && !this.dragItem) {
            this.lastPosX = evt.target.x;
            this.lastPosY = evt.target.y;
            this.dragItem = evt.target;
            this.dragItem.startDrag();
        }
    }

    onMouseUp(evt: Laya.Event) {
        if (this.dragItem) {
            this.dragItem.stopDrag();
            let newPosX = this.dragItem.x;
            let newPosY = this.dragItem.y;
            this.dragItem.x = this.lastPosX;
            this.dragItem.y = this.lastPosY;
            if (Math.abs(newPosY - this.lastPosY) < 10) {
                this.dragItem = null;
                return;
            }
            evt.stopPropagation();

            if (newPosX < -100 || newPosX > this.listAniName.width || newPosY < -80 || newPosY > this.listAniName.height) {
                console.log('超界了');
            } else {
                if (newPosY < 0 && this.dragItem.renderIndex != 0) {
                    switchCell(this.dragItem, this.nameRenderList[0])
                } else {
                    let i = 0;
                    let n = this.nameRenderList.length;
                    let needMove = false;
                    for (; i < n; i++) {
                        let cell = this.nameRenderList[i];
                        if (cell.dataSource == this.dragItem.dataSource) {
                            continue;
                        }
                        if (newPosY > cell.y) {
                            if (i + 1 < n) {
                                let nextCell = this.nameRenderList[i + 1];
                                if (newPosY < nextCell.y) {
                                    if (newPosY > this.lastPosY)
                                        switchCell(this.dragItem, cell);
                                    else
                                        switchCell(this.dragItem, nextCell);
                                    break;
                                }
                            }
                            needMove = true;
                        }
                    }

                    if (i == n && needMove) {
                        switchCell(this.dragItem, this.nameRenderList[n - 1])
                    }
                }
            }
            this.dragItem = null;
        }
    }
}