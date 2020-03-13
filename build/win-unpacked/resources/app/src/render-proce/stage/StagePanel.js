"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EvtCenter_1 = require("../cmm/EvtCenter");
const AniEntity_1 = __importDefault(require("../cmm/AniEntity"));
const render_dao_1 = require("../cmm/render-dao");
const electron_1 = require("electron");
const ani_frame_edit_1 = require("../frame/ani-frame-edit");
const ani_on_stage_1 = require("./ani-on-stage");
const layaMaxUI_1 = require("../../ui/layaMaxUI");
const stage_attr_1 = require("../attr/stage-attr");
const AniListRender_1 = __importDefault(require("../anilist/AniListRender"));
const ActFrameListRender_1 = __importDefault(require("../frame/ActFrameListRender"));
const ani_frame_offset_1 = require("../attr/ani-frame-offset");
const ActFrameRender_1 = __importDefault(require("../frame/ActFrameRender"));
class StagePanel extends layaMaxUI_1.ui.scene.StagePanelUI {
    constructor() {
        super();
        this.totalFrameNum = 0;
        this.frameIndex = 0;
        this.showList = new Map();
    }
    onEnable() {
        super.onEnable();
        stage_attr_1.imgBGHandle(this);
        this.on(Laya.Event.CLICK, this, this.onClick);
        Laya.stage.on(Laya.Event.KEY_DOWN, this, this.onKeyDown);
        Laya.stage.on(Laya.Event.KEY_UP, this, this.onKeyUp);
        EvtCenter_1.EvtCenter.on(EvtCenter_1.AE_Event.ANI_TO_STAGE, this, this.onAddToStage);
        EvtCenter_1.EvtCenter.on(EvtCenter_1.AE_Event.ANI_REMOVE_STAGE, this, this.onRemoveToStage);
        EvtCenter_1.EvtCenter.on(EvtCenter_1.AE_Event.ANI_TO_PLAY, this, this.onAniToPlay);
        ani_on_stage_1.aniToStageHandle(this);
    }
    onAddToStage(name) {
        if (!this.showList.has(name)) {
            let aniEntity = render_dao_1.aniEntityDict.get(name);
            this.showList.set(name, aniEntity);
            aniEntity.pos(render_dao_1.globalDao.coordinateX, render_dao_1.globalDao.coordinateY);
            this.container.addChild(aniEntity);
            aniEntity.setTexture(render_dao_1.globalDao.curFrameIndex);
        }
        else {
            electron_1.remote.dialog.showErrorBox('警告', `场景中存在相同的动画名:${name}`);
        }
    }
    onRemoveToStage(name) {
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
    onClick(evt) {
        this.focusTarget = evt.target;
    }
    //播放
    onAniToPlay(val) {
        this.isPlay = val;
        if (val) {
            this.totalFrameNum = 0;
            this.showList.forEach(val => {
                if (this.totalFrameNum < val.totalFrameNum) {
                    this.totalFrameNum = val.totalFrameNum;
                }
            });
            Laya.timer.loop(1000 / render_dao_1.confParam.frameRate, this, this.loop);
        }
        else
            Laya.timer.clear(this, this.loop);
    }
    loop() {
        if (this.frameIndex > this.totalFrameNum - 1)
            this.frameIndex = 0;
        ani_on_stage_1.setAllAniFrameIndex(this.frameIndex);
        ani_frame_edit_1.setCurFrameIndex(this.frameIndex, this.getCurAniEntity());
        this.frameIndex++;
    }
    onKeyDown(evt) {
        //删除当前帧
        if (evt.keyCode == Laya.Keyboard.DELETE) {
            ///todo
            ani_frame_edit_1.delCurFrame(this.getCurAniEntity());
            return;
        }
        if (evt.keyCode == Laya.Keyboard.SPACE) {
            EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_TO_PLAY, !this.isPlay);
            return;
        }
        //移动
        if (evt.keyCode == Laya.Keyboard.UP) {
            this.onMove(0, -1);
        }
        else if (evt.keyCode == Laya.Keyboard.DOWN) {
            this.onMove(0, 1);
        }
        else if (evt.keyCode == Laya.Keyboard.LEFT) {
            this.onMove(-1, 0);
        }
        else if (evt.keyCode == Laya.Keyboard.RIGHT) {
            this.onMove(1, 0);
        }
    }
    onKeyUp(evt) {
        if (evt.keyCode == Laya.Keyboard.CONTROL)
            return;
        //ctrl + c
        if (evt.keyCode == Laya.Keyboard.C && evt.ctrlKey) {
            if (this.focusTarget instanceof AniListRender_1.default || this.focusTarget instanceof AniEntity_1.default
                || this.focusTarget instanceof ActFrameListRender_1.default || this.focusTarget instanceof ActFrameRender_1.default) {
                //复制当前帧
                render_dao_1.frameCopy.isCopyFrame = true;
                render_dao_1.frameCopy.copyAniName = render_dao_1.globalDao.curAniName;
                render_dao_1.frameCopy.copyFrameIndex = render_dao_1.globalDao.curFrameIndex;
                return;
            }
        }
        if (evt.keyCode == Laya.Keyboard.V && render_dao_1.frameCopy.isCopyFrame && evt.ctrlKey) {
            if (this.focusTarget instanceof AniListRender_1.default || this.focusTarget instanceof AniEntity_1.default
                || this.focusTarget instanceof ActFrameListRender_1.default || this.focusTarget instanceof ActFrameRender_1.default) {
                //粘贴当前帧
                if (render_dao_1.globalDao.curAniName == render_dao_1.frameCopy.copyAniName) {
                    ani_frame_edit_1.copyFrame(this.getCurAniEntity());
                    return;
                }
            }
        }
        render_dao_1.frameCopy.isCopyFrame = false;
    }
    onMove(offsetX, offsetY) {
        if (render_dao_1.globalDao.curAniName == '')
            return;
        let aniEnty = render_dao_1.aniEntityDict.get(render_dao_1.globalDao.curAniName);
        let x = aniEnty.image.x;
        x += offsetX;
        let y = aniEnty.image.y;
        y += offsetY;
        ani_frame_offset_1.sysAniFrameOffset(x, y);
        EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_FRAME_EVENT, [EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_OFFSETX, x]);
        EvtCenter_1.EvtCenter.send(EvtCenter_1.AE_Event.ANI_FRAME_EVENT, [EvtCenter_1.ANI_FRAME_TYPE.ANI_FRAME_OFFSETY, y]);
    }
    getCurAniEntity() {
        if (render_dao_1.aniEntityDict.has(render_dao_1.globalDao.curAniName))
            return render_dao_1.aniEntityDict.get(render_dao_1.globalDao.curAniName);
        return null;
    }
}
exports.default = StagePanel;
