import { stagePropertyHandle } from "./stage-attr";
import { aniFrameEffectHandle } from "./ani-frame-effect";
import { aniSaveHandle } from "./ani-save";
import { aniFrameOffsetHandle } from "./ani-frame-offset";
import { ui } from "../../ui/layaMaxUI";
import { ImportType } from "../cmm/EvtCenter";
import { ipcRenderer } from "electron";
import PartEntity from "../cmm/PartEntity";
import { globalDao, aniEntityDict } from "../cmm/render-dao";

export default class AttrPanel extends ui.scene.AttrPanelUI {
    constructor() {
        super();
    }

    onEnable() {
        stagePropertyHandle(this);
        aniFrameEffectHandle(this);
        aniSaveHandle(this);
        aniFrameOffsetHandle(this);

        //导入特效和模型
        this.btnEffect.on(Laya.Event.CLICK, this, this.toImport, [ImportType.Effect]);
        this.btnHit.on(Laya.Event.CLICK, this, this.toImport, [ImportType.Hit]);
        this.btnHero.on(Laya.Event.CLICK, this, this.toImport, [ImportType.Hero]);
        this.btnEnemy.on(Laya.Event.CLICK, this, this.toImport, [ImportType.Enemy]);

        ipcRenderer.on('m2r_import-atlas', (event, type: ImportType, aniInfo: AniInfo) => {
            this.handleAniInfo(type, aniInfo);
        })
    }

    toImport(type: ImportType) {
        if (globalDao.curAniName == "") return;
        ipcRenderer.send('r2m_import-atlas', type);
    }

    handleAniInfo(type: ImportType, aniInfo: AniInfo): void {
        let partEntity: PartEntity = new PartEntity(aniInfo, type < ImportType.Hero);
        let curEntity = aniEntityDict.get(globalDao.curAniName);
        if (!curEntity) return;
        switch (type) {
            case ImportType.Effect:
                curEntity.bindEffect(partEntity);
                break;
            case ImportType.Hit:
                curEntity.bindHit(partEntity);
                break;
            case ImportType.Hero:
                curEntity.bindHero(partEntity);
                break;
            case ImportType.Enemy:
                curEntity.bindEnemy(partEntity);
                break;
        }
    }
}