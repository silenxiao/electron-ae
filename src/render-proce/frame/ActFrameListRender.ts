import { aniEntityDict, globalDao, frameCopy } from "../cmm/render-dao";
import AniEntity from "../cmm/AniEntity";
import { setCurFrameIndex } from "./ani-frame-edit";
import ActFrameRender from "./ActFrameRender";
import { setAllAniFrameIndex } from "../stage/ani-on-stage";

export default class ActAniRender extends Laya.Box {
    listFrame: Laya.List;
    aniEntity: AniEntity;
    imgSelectAll: Laya.Image;
    lastSelectIndex: number;
    constructor() {
        super();
    }

    onEnable() {
        this.listFrame = this.getChildByName('listFrame') as Laya.List;
        this.imgSelectAll = this.getChildByName('imgSelectAll') as Laya.Image;
        this.imgSelectAll.visible = false;
        this.listFrame.renderHandler = Laya.Handler.create(this, this.onFrameRender, null, false);
        this.listFrame.selectHandler = Laya.Handler.create(this, this.onFrameSelect, null, false);
        this.listFrame.mouseHandler = Laya.Handler.create(this, this.listFrameClick, null, false);
        this.listFrame.dataSource;
        this.listFrame.selectEnable = true;
    }

    setData(val: string) {
        this.aniEntity = aniEntityDict.get(val) as AniEntity;
        this.listFrame.dataSource = this.aniEntity.frameEffects;
    }

    onFrameRender(cell: ActFrameRender) {
        cell.setData(cell.dataSource);
    }

    onFrameSelect(index: number) {
        setAllAniFrameIndex(index);
        setCurFrameIndex(index, this.aniEntity);
    }

    listFrameClick(evt: Laya.Event) {

        if (evt.type == "click") {
            if (evt.shiftKey) {
                let beinIndex = globalDao.copyIndexRang[0];
                let endIndex = this.listFrame.selectedIndex;
                if (beinIndex == endIndex) {
                    this.imgSelectAll.visible = false;
                    return;
                }

                if (beinIndex < endIndex) {
                    this.imgSelectAll.x = beinIndex * 20;
                    globalDao.copyIndexRang[1] = endIndex;
                } else {
                    this.imgSelectAll.x = endIndex * 20;
                    globalDao.copyIndexRang[0] = endIndex;
                    globalDao.copyIndexRang[1] = beinIndex;
                }

                this.imgSelectAll.visible = true;
                this.imgSelectAll.width = (Math.abs(beinIndex - endIndex) + 1) * 20;

            } else {
                this.imgSelectAll.visible = false;
                globalDao.copyIndexRang[1] = globalDao.copyIndexRang[0] = this.listFrame.selectedIndex;
            }
        }
    }

    resetSelect() {
        this.imgSelectAll.visible = false;
        globalDao.copyIndexRang[1] = globalDao.copyIndexRang[0] = 0;
    }
}