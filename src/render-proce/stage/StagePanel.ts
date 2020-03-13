import { EvtCenter, AE_Event, ANI_FRAME_TYPE } from "../cmm/EvtCenter";
import AniEntity from "../cmm/AniEntity";
import { aniEntityDict, globalDao, confParam, frameCopy } from "../cmm/render-dao";
import { remote } from "electron";
import { setCurFrameIndex, delCurFrame, copyFrame } from "../frame/ani-frame-edit";
import { aniToStageHandle, setAllAniFrameIndex } from "./ani-on-stage";
import { ui } from "../../ui/layaMaxUI";
import { imgBGHandle } from "../attr/stage-attr";
import AniListRender from "../anilist/AniListRender";
import ActAniRender from "../frame/ActFrameListRender";
import { sysAniFrameOffset } from "../attr/ani-frame-offset";
import ActFrameRender from "../frame/ActFrameRender";

export default class StagePanel extends ui.scene.StagePanelUI {
    showList: Map<string, AniEntity>;
    totalFrameNum: number = 0;
    focusTarget: Laya.Sprite;
    isPlay: boolean;
    frameIndex: number = 0;
    constructor() {
        super();
        this.showList = new Map<string, AniEntity>();
    }

    onEnable() {
        super.onEnable();
        imgBGHandle(this);

        this.on(Laya.Event.CLICK, this, this.onClick);

        Laya.stage.on(Laya.Event.KEY_DOWN, this, this.onKeyDown);
        Laya.stage.on(Laya.Event.KEY_UP, this, this.onKeyUp);

        EvtCenter.on(AE_Event.ANI_TO_STAGE, this, this.onAddToStage);
        EvtCenter.on(AE_Event.ANI_REMOVE_STAGE, this, this.onRemoveToStage);
        EvtCenter.on(AE_Event.ANI_TO_PLAY, this, this.onAniToPlay);

        aniToStageHandle(this);
    }

    onAddToStage(name: string) {
        if (!this.showList.has(name)) {
            let aniEntity = aniEntityDict.get(name);
            this.showList.set(name, aniEntity);
            aniEntity.pos(globalDao.coordinateX, globalDao.coordinateY);
            this.container.addChild(aniEntity);
            aniEntity.setTexture(globalDao.curFrameIndex)
        } else {
            remote.dialog.showErrorBox('警告', `场景中存在相同的动画名:${name}`);
        }
    }

    onRemoveToStage(name: string) {
        if (this.showList.has(name)) {
            this.container.removeChild(this.showList.get(name));
            this.showList.delete(name);
            this.totalFrameNum = 0;
            this.showList.forEach(val => {
                if (this.totalFrameNum < val.totalFrameNum) {
                    this.totalFrameNum = val.totalFrameNum;
                }
            });
        }
    }
    onClick(evt: Laya.Event) {
        this.focusTarget = evt.target
    }

    //播放
    onAniToPlay(val: boolean) {
        this.isPlay = val;
        if (val) {
            this.totalFrameNum = 0;
            this.showList.forEach(val => {
                if (this.totalFrameNum < val.totalFrameNum) {
                    this.totalFrameNum = val.totalFrameNum;
                }
            });
            Laya.timer.loop(1000 / confParam.frameRate, this, this.loop);
        }
        else
            Laya.timer.clear(this, this.loop);
    }

    loop() {
        if (this.frameIndex > this.totalFrameNum - 1) this.frameIndex = 0;
        setAllAniFrameIndex(this.frameIndex);
        setCurFrameIndex(this.frameIndex, this.getCurAniEntity());
        this.frameIndex++;
    }

    onKeyDown(evt: Laya.Event) {
        //删除当前帧
        if (evt.keyCode == Laya.Keyboard.DELETE) {
            ///todo
            delCurFrame(this.getCurAniEntity());
            return;
        }
        if (evt.keyCode == Laya.Keyboard.SPACE) {
            EvtCenter.send(AE_Event.ANI_TO_PLAY, !this.isPlay);
            return;
        }
        //移动
        if (evt.keyCode == Laya.Keyboard.UP) {
            this.onMove(0, -1);
        } else if (evt.keyCode == Laya.Keyboard.DOWN) {
            this.onMove(0, 1);
        } else if (evt.keyCode == Laya.Keyboard.LEFT) {
            this.onMove(-1, 0);
        } else if (evt.keyCode == Laya.Keyboard.RIGHT) {
            this.onMove(1, 0);
        }
    }

    onKeyUp(evt: Laya.Event) {
        if (evt.keyCode == Laya.Keyboard.CONTROL) return;
        //ctrl + c
        if (evt.keyCode == Laya.Keyboard.C && evt.ctrlKey) {
            if (this.focusTarget instanceof AniListRender || this.focusTarget instanceof AniEntity
                || this.focusTarget instanceof ActAniRender || this.focusTarget instanceof ActFrameRender) {
                //复制当前帧
                frameCopy.isCopyFrame = true;
                frameCopy.copyAniName = globalDao.curAniName;
                frameCopy.copyFrameIndex = globalDao.curFrameIndex;
                return;
            }
        }

        if (evt.keyCode == Laya.Keyboard.V && frameCopy.isCopyFrame && evt.ctrlKey) {
            if (this.focusTarget instanceof AniListRender || this.focusTarget instanceof AniEntity
                || this.focusTarget instanceof ActAniRender || this.focusTarget instanceof ActFrameRender) {
                //粘贴当前帧
                if (globalDao.curAniName == frameCopy.copyAniName) {
                    copyFrame(this.getCurAniEntity());
                    return;
                }
            }

        }
        frameCopy.isCopyFrame = false;
    }

    onMove(offsetX: number, offsetY: number) {
        if (globalDao.curAniName == '') return;
        let aniEnty: AniEntity = aniEntityDict.get(globalDao.curAniName);
        let x = aniEnty.image.x;
        x += offsetX;
        let y = aniEnty.image.y;
        y += offsetY;

        sysAniFrameOffset(x, y);

        EvtCenter.send(AE_Event.ANI_FRAME_EVENT, [ANI_FRAME_TYPE.ANI_FRAME_OFFSETX, x]);

        EvtCenter.send(AE_Event.ANI_FRAME_EVENT, [ANI_FRAME_TYPE.ANI_FRAME_OFFSETY, y]);
    }

    getCurAniEntity(): AniEntity {
        if (aniEntityDict.has(globalDao.curAniName))
            return aniEntityDict.get(globalDao.curAniName);
        return null;
    }

}