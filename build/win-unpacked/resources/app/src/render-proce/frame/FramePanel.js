"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EvtCenter_1 = require("../cmm/EvtCenter");
const ActAniNameRender_1 = __importDefault(require("./ActAniNameRender"));
const render_dao_1 = require("../cmm/render-dao");
const ani_frame_edit_1 = require("./ani-frame-edit");
const layaMaxUI_1 = require("../../ui/layaMaxUI");
const ani_save_1 = require("../attr/ani-save");
class FramePanel extends layaMaxUI_1.ui.scene.FramePanelUI {
    constructor() {
        super();
        this.dataList = [];
        this.aniSelectedIndex = 0;
        this.renderList = [];
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
        this.listgradua.renderHandler = Laya.Handler.create(this, this.onGraduaRender, null, false);
        let arr = [];
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
        EvtCenter_1.EvtCenter.on(EvtCenter_1.AE_Event.ANI_TO_STAGE, this, this.onAddToStage);
        EvtCenter_1.EvtCenter.on(EvtCenter_1.AE_Event.ANI_REMOVE_STAGE, this, this.onRemoveToStage);
        EvtCenter_1.EvtCenter.on(EvtCenter_1.AE_Event.ANI_SELECTED, this, this.onAniSelected);
        EvtCenter_1.EvtCenter.on(EvtCenter_1.AE_Event.ANI_TO_PLAY, this, this.onAniToPlay);
        ani_frame_edit_1.aniFrameEdit(this);
    }
    /* 帧数重置 */
    onFrameReset() {
        if (this.curAniEnity == null)
            return;
        EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_FRAME_EVENT, EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAMES_RESET);
        this.listActAni.changeItem(this.aniSelectedIndex, this.curAniEnity.aniInfo.aniName);
    }
    onFrameSave() {
        if (this.curAniEnity == null)
            return;
        EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_FRAME_EVENT, EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAMES_SAVE);
    }
    //插入空白帧
    onBtnBlackClick() {
        let num = Number(this.cbBlank.selectedLabel);
        if (this.curAniEnity == null)
            return;
        this.curAniEnity.addBlankFrame(num);
        this.listActAni.changeItem(this.aniSelectedIndex, this.curAniEnity.aniInfo.aniName);
    }
    //复制前一帧
    onBtnCopyClick() {
        let num = Number(this.cbCopy.selectedLabel);
        if (this.curAniEnity == null)
            return;
        this.curAniEnity.addCopyFrameNum(num);
        this.listActAni.changeItem(this.aniSelectedIndex, this.curAniEnity.aniInfo.aniName);
    }
    //当前帧后查一帧
    onBtnInsertClick() {
        if (this.curAniEnity == null)
            return;
        this.curAniEnity.insertFrame();
        this.listActAni.changeItem(this.aniSelectedIndex, this.curAniEnity.aniInfo.aniName);
    }
    onAniToPlay(val) {
        this.btnStop.visible = val;
        this.btnPlay.visible = !val;
    }
    //动画播放
    onBtnPlay() {
        EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_TO_PLAY, true);
    }
    onBtnStop() {
        EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_TO_PLAY, false);
    }
    //显示边框
    onChkSelected() {
        render_dao_1.globalDao.showSelected = this.chkselect.selected;
        if (this.curAniEnity == null)
            return;
        this.curAniEnity.showFilter();
    }
    //刻度显示
    onGraduaRender(cell, index) {
        let lblGradua = cell.getChildByName('lblGradua');
        if (index % 5 == 0)
            lblGradua.text = index.toString();
        else
            lblGradua.text = '•';
    }
    onAniNameRender(cell, index) {
        cell.setData(cell.dataSource, index);
        this.renderList[index] = cell;
        if (this.listAniName.selectedIndex == -1) {
            this.listAniName.selectedIndex = 0;
        }
    }
    //设置帧参数
    onListAniRender(cell) {
        cell.setData(cell.dataSource);
    }
    onListAniSelect(index) {
        EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_SELECTED, this.dataList[index]);
    }
    onAddToStage(name) {
        if (this.dataList.indexOf(name) < 0) {
            this.dataList.push(name);
            this.listAniName.refresh();
            this.listActAni.refresh();
        }
    }
    onRemoveToStage(name) {
        let index = this.dataList.indexOf(name);
        if (index >= 0) {
            this.dataList.splice(index, 1);
            this.listAniName.refresh();
            this.listActAni.refresh();
        }
        if (this.dataList.length == 0) {
            EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_TO_PLAY, false);
        }
        if (render_dao_1.globalDao.curAniName == name) {
            render_dao_1.globalDao.curAniName = '';
            ani_save_1.setTxtCurAniName('');
            this.curAniEnity = null;
        }
    }
    onAniSelected(aniName) {
        let index = this.dataList.indexOf(aniName);
        if (this.aniSelectedIndex != index) {
            this.renderList[this.aniSelectedIndex].selected = false;
            this.curAniEnity.selected = false;
        }
        if (index >= 0) {
            this.renderList[index].selected = true;
            this.aniSelectedIndex = index;
            this.curAniEnity = render_dao_1.aniEntityDict.get(this.dataList[index]);
            this.curAniEnity.selected = true;
            this.curAniEnity.sysFrameDataToPanel();
        }
        render_dao_1.globalDao.curAniName = aniName;
        ani_save_1.setTxtCurAniName(aniName);
    }
    /**拖拽 */
    onMouseDown(evt) {
        if (evt.target instanceof ActAniNameRender_1.default && !this.dragItem) {
            this.lastPosX = evt.target.x;
            this.lastPosY = evt.target.y;
            this.dragItem = evt.target;
            this.dragItem.startDrag();
        }
    }
    onMouseUp(evt) {
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
            }
            else {
                if (newPosY < 0 && this.dragItem.renderIndex != 0) {
                    ani_frame_edit_1.switchCell(this.dragItem, this.renderList[0]);
                }
                else {
                    let i = 0;
                    let n = this.renderList.length;
                    let needMove = false;
                    for (; i < n; i++) {
                        let cell = this.renderList[i];
                        if (cell.dataSource == this.dragItem.dataSource) {
                            continue;
                        }
                        if (newPosY > cell.y) {
                            if (i + 1 < n) {
                                let nextCell = this.renderList[i + 1];
                                if (newPosY < nextCell.y) {
                                    if (newPosY > this.lastPosY)
                                        ani_frame_edit_1.switchCell(this.dragItem, cell);
                                    else
                                        ani_frame_edit_1.switchCell(this.dragItem, nextCell);
                                    break;
                                }
                            }
                            needMove = true;
                        }
                    }
                    if (i == n && needMove) {
                        ani_frame_edit_1.switchCell(this.dragItem, this.renderList[n - 1]);
                    }
                }
            }
            this.dragItem = null;
        }
    }
}
exports.default = FramePanel;
