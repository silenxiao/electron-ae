import { aniEntityDict } from "../cmm/render-dao";
import AniEntity from "../cmm/AniEntity";
import { setCurFrameIndex } from "./ani-frame-edit";
import ActFrameRender from "./ActFrameRender";
import { setAllAniFrameIndex } from "../stage/ani-on-stage";

export default class ActAniRender extends Laya.Box {
    listFrame: Laya.List;
    aniEntity: AniEntity;
    constructor() {
        super();
    }

    onEnable() {
        this.listFrame = this.getChildByName('listFrame') as Laya.List;
        this.listFrame.renderHandler = Laya.Handler.create(this, this.onFrameRender, null, false);
        this.listFrame.selectHandler = Laya.Handler.create(this, this.onFrameSelect, null, false);
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
}