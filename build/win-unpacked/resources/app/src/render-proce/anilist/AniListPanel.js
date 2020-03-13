"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const AniEntity_1 = __importDefault(require("../cmm/AniEntity"));
const render_dao_1 = require("../cmm/render-dao");
const EvtCenter_1 = require("../cmm/EvtCenter");
const layaMaxUI_1 = require("../../ui/layaMaxUI");
class LeftPanel extends layaMaxUI_1.ui.scene.AniListPanelUI {
    constructor() {
        super();
        this.dataList = [];
        this.renderList = [];
        this.selectIndex = -1;
        this.isPlaying = false;
        this.isResLoaded = false;
        this.interval = 2;
        this.count = 0;
        this.curFrameIndex = 0;
    }
    onEnable() {
        this.btnDelAll.on(Laya.Event.CLICK, this, this.onDelAll);
        this.aniList.selectHandler = Laya.Handler.create(this, this.onSelect, null, false);
        this.aniList.renderHandler = Laya.Handler.create(this, this.onRender, null, false);
        this.aniList.selectEnable = true;
        this.aniList.array = this.dataList;
        this.chkDefaultFrame.toolTip = '设置动画帧播放的间隔';
        this.chkDefaultFrame.on(Laya.Event.CHANGE, this, this.onDefaultFrame);
        this.btnZoomIn.toolTip = "缩小动画";
        this.btnZoomIn.on(Laya.Event.CLICK, this, this.onZoomIn);
        this.btnShowPlay.on(Laya.Event.CLICK, this, this.onPlay);
        this.btnShowStop.on(Laya.Event.CLICK, this, this.onStop);
        this.btnShowPlay.visible = true;
        this.btnShowStop.visible = false;
        this.isPlaying = false;
        this.btnZoomOut.toolTip = "放大动画";
        this.btnZoomOut.on(Laya.Event.CLICK, this, this.onZoomOut);
        this.showImg.pos(this.showpanel.width >> 1, this.showpanel.height);
        EvtCenter_1.EvtCenter.on(EvtCenter_1.AE_Event.ANI_DEL, this, this.onAniDel);
        EvtCenter_1.EvtCenter.on(EvtCenter_1.AE_Event.ANI_TO_SHOW, this, this.onAniShow);
        /**
         * 监听文件拖拽
         */
        electron_1.ipcRenderer.on('drag-ani', (event, aniInfo) => {
            render_dao_1.aniEntityDict.set(aniInfo.aniName, new AniEntity_1.default(aniInfo));
            this.dataList.push(aniInfo.aniName);
            this.aniList.refresh();
            this.aniList.selectedIndex = this.selectIndex;
        });
    }
    onAniDel(aniName) {
        let index = this.dataList.indexOf(aniName);
        if (index >= 0) {
            this.dataList.splice(index, 1);
            this.delAniByName(aniName);
        }
    }
    onDelAll() {
        while (this.dataList.length > 0) {
            let aniName = this.dataList.pop();
            this.delAniByName(aniName);
        }
    }
    delAniByName(aniName) {
        EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_REMOVE_STAGE, aniName);
        if (render_dao_1.aniEntityDict.has(aniName)) {
            render_dao_1.aniEntityDict.get(aniName).destroy();
            render_dao_1.aniEntityDict.delete(aniName);
        }
        this.aniList.refresh();
        electron_1.ipcRenderer.send('ani-del', aniName);
    }
    /**
     * 模型列表选中
     * @param {列表索引} index
     */
    onSelect(index) {
        if (this.selectIndex != index && this.selectIndex != -1)
            this.renderList[this.selectIndex].select = false;
        this.renderList[index].select = true;
        this.selectIndex = index;
    }
    /**
     * render数据设置
     * @param {list 的render} cell
     * @param {索引} index
     */
    onRender(cell, index) {
        cell.setData(cell.dataSource, index);
        this.renderList[index] = cell;
    }
    onAniShow(aniName) {
        this.isResLoaded = false;
        this.aniName = aniName;
        let aniInfo = render_dao_1.aniEntityDict.get(aniName).aniInfo;
        if (aniInfo.images.length > 0) {
            Laya.loader.load(aniInfo.images, Laya.Handler.create(this, this.onAssetsLoaded, [aniInfo]));
        }
    }
    onAssetsLoaded(aniInfo) {
        if (aniInfo.aniName != this.aniName) {
            return;
        }
        this.aniInfo = aniInfo;
        this.isResLoaded = true;
        this.showImg.pivot(this.aniInfo.pivot.x, this.aniInfo.pivot.y);
        this.onDefaultFrame();
        this.showImg.scaleX = 1;
        this.showImg.scaleY = 1;
        this.showImg.texture = Laya.loader.getRes(this.aniInfo.images[this.aniInfo.frameIndxs[0]]);
    }
    loop() {
        if (!this.isResLoaded)
            return;
        if (this.count++ < this.interval) {
            return;
        }
        this.count = 0;
        while (this.aniInfo.frameIndxs[this.curFrameIndex] == -1)
            this.curFrameIndex++;
        this.showImg.texture = Laya.loader.getRes(this.aniInfo.images[this.aniInfo.frameIndxs[this.curFrameIndex]]);
        this.curFrameIndex++;
        if (this.curFrameIndex >= this.aniInfo.frameIndxs.length)
            this.curFrameIndex = 0;
    }
    onPlay() {
        if (this.isPlaying)
            return;
        this.isPlaying = true;
        Laya.timer.loop(1000 / render_dao_1.confParam.frameRate, this, this.loop);
        this.btnShowPlay.visible = false;
        this.btnShowStop.visible = true;
    }
    onStop() {
        this.isPlaying = false;
        Laya.timer.clear(this, this.loop);
        this.btnShowPlay.visible = true;
        this.btnShowStop.visible = false;
    }
    onZoomIn() {
        this.showImg.scaleX -= 0.1;
        this.showImg.scaleY -= 0.1;
    }
    onZoomOut() {
        this.showImg.scaleX += 0.1;
        this.showImg.scaleY += 0.1;
    }
    //设置默认帧数
    onDefaultFrame() {
        if (this.aniName == "")
            return;
        if (this.chkDefaultFrame.selected) {
            this.interval = 2;
            let frameIntev = render_dao_1.confParam.frameIntev;
            for (var key in frameIntev) {
                if (this.aniName.indexOf(key) >= 0) {
                    this.interval = Number(frameIntev[key]);
                    ;
                }
            }
        }
        else {
            this.interval = 0;
        }
    }
}
exports.default = LeftPanel;
