import { ipcRenderer } from "electron";
import AniEntity from "../cmm/AniEntity";
import { aniEntityDict, confParam } from "../cmm/render-dao";
import AniListRender from "./AniListRender";
import { EvtCenter, AE_Event } from "../cmm/EvtCenter";
import { ui } from "../../ui/layaMaxUI";
import { addAniToComboBox, delAniToComboBox } from "../attr/ani-frame-effect";

export default class LeftPanel extends ui.scene.AniListPanelUI {
    dataList: string[] = [];
    renderList: AniListRender[] = [];
    selectIndex: number = -1;
    isPlaying: boolean = false;
    isResLoaded: boolean = false;
    aniInfo: AniInfo;
    aniName: string;
    interval: number = 2;
    count: number = 0;
    curFrameIndex: number = 0;
    constructor() {
        super();
    }

    onEnable() {
        this.btnDelAll.on(Laya.Event.CLICK, this, this.onDelAll);
        this.aniList.selectHandler = Laya.Handler.create(this, this.onSelect, null, false);
        this.aniList.renderHandler = Laya.Handler.create(this, this.onRender, null, false);
        this.aniList.selectEnable = true;
        this.aniList.array = this.dataList;

        this.chkDefaultFrame.toolTip = '设置动画帧播放的间隔'
        this.chkDefaultFrame.on(Laya.Event.CHANGE, this, this.onDefaultFrame)

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


        EvtCenter.on(AE_Event.ANI_DEL, this, this.onAniDel);

        EvtCenter.on(AE_Event.ANI_TO_SHOW, this, this.onAniShow);
        /**
         * 监听文件拖拽
         */
        ipcRenderer.on('drag-ani', (event, aniInfo: AniInfo) => {
            aniEntityDict.set(aniInfo.aniName, new AniEntity(aniInfo));
            this.dataList.push(aniInfo.aniName);
            this.aniList.refresh();
            addAniToComboBox(aniInfo.aniName);
            this.aniList.selectedIndex = this.selectIndex;
        })
    }

    onAniDel(aniName: string) {
        let index = this.dataList.indexOf(aniName);
        if (index >= 0) {
            this.renderList[index].reset();
            this.dataList.splice(index, 1);
            this.delAniByName(aniName)
        }
    }

    onDelAll() {
        while (this.dataList.length > 0) {
            this.renderList[this.dataList.length - 1].reset();
            let aniName = this.dataList.pop();
            this.delAniByName(aniName)
        }
    }

    delAniByName(aniName: string) {
        EvtCenter.send(AE_Event.ANI_REMOVE_STAGE, aniName);
        if (aniEntityDict.has(aniName)) {
            aniEntityDict.get(aniName).destroy();
            aniEntityDict.delete(aniName);
        }
        this.aniList.refresh();
        delAniToComboBox(aniName);
        ipcRenderer.send('ani-del', aniName);
    }


    /**
     * 模型列表选中
     * @param {列表索引} index 
     */
    onSelect(index: number) {
        if (this.selectIndex != index && this.selectIndex != -1)
            this.renderList[this.selectIndex].select = false;
        if (index != -1)
            this.renderList[index].select = true;
        this.selectIndex = index;
    }

    /**
     * render数据设置
     * @param {list 的render} cell 
     * @param {索引} index 
     */
    onRender(cell: AniListRender, index: number) {
        cell.setData(cell.dataSource, index);
        this.renderList[index] = cell;
    }


    onAniShow(aniName: string) {
        this.isResLoaded = false;
        this.aniName = aniName;
        let aniInfo = aniEntityDict.get(aniName).aniInfo;
        if (aniInfo.images.length > 0) {
            Laya.loader.load(aniInfo.images, Laya.Handler.create(this, this.onAssetsLoaded, [aniInfo]));
        }
    }

    onAssetsLoaded(aniInfo: AniInfo) {
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
        if (!this.isResLoaded) return;
        if (this.count++ < this.interval) {
            return;
        }
        this.count = 0;
        while (this.aniInfo.frameIndxs[this.curFrameIndex] == -1)
            this.curFrameIndex++;
        this.showImg.texture = Laya.loader.getRes(this.aniInfo.images[this.aniInfo.frameIndxs[this.curFrameIndex]]);
        this.curFrameIndex++;
        if (this.curFrameIndex >= this.aniInfo.frameIndxs.length) this.curFrameIndex = 0;
    }

    onPlay() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        Laya.timer.frameLoop(2, this, this.loop);
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
        if (this.aniName == "") return;
        if (this.chkDefaultFrame.selected) {
            this.interval = 2;
            let frameIntev: any = confParam.frameIntev;
            for (var key in frameIntev) {
                if (this.aniName.indexOf(key) >= 0) {
                    this.interval = Number(frameIntev[key]);;
                }
            }
        } else {
            this.interval = 0;
        }
    }
}