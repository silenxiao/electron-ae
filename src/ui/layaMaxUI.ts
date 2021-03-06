/**This class is automatically generated by LayaAirIDE, please do not make any modifications. */
import View=Laya.View;
import Dialog=Laya.Dialog;
import Scene=Laya.Scene;
var REG: Function = Laya.ClassUtils.regClass;
export module ui.scene {
    export class AniListPanelUI extends Scene {
		public listpanel:Laya.Panel;
		public btnDelAll:Laya.Button;
		public aniList:Laya.List;
		public btnAniDel:Laya.Button;
		public chkDefaultFrame:Laya.CheckBox;
		public btnShowPlay:Laya.Button;
		public btnShowStop:Laya.Button;
		public showpanel:Laya.Panel;
		public showImg:Laya.Image;
		public btnZoomIn:Laya.Button;
		public btnZoomOut:Laya.Button;
        constructor(){ super()}
        createChildren():void {
            super.createChildren();
            this.loadScene("scene/AniListPanel");
        }
    }
    REG("ui.scene.AniListPanelUI",AniListPanelUI);
    export class AttrPanelUI extends Scene {
		public attrpanel:Laya.Panel;
		public bgattrpanel:Laya.Panel;
		public btnBG:Laya.Button;
		public bgLock:Laya.CheckBox;
		public bgReset:Laya.Button;
		public bgSave:Laya.Button;
		public bgX:Laya.TextInput;
		public bgY:Laya.TextInput;
		public txtBGUrl:Laya.TextInput;
		public coordinatepanel:Laya.Panel;
		public coordReset:Laya.Button;
		public coordSave:Laya.Button;
		public btCurAniCoordReset:Laya.Button;
		public btAllAniCoordReset:Laya.Button;
		public txtCoordinateX:Laya.TextInput;
		public txtCoordinateY:Laya.TextInput;
		public btnHide:Laya.CheckBox;
		public btnUp:Laya.Button;
		public btnDown:Laya.Button;
		public btnOffsetReset:Laya.Button;
		public xReset:Laya.Button;
		public yReset:Laya.Button;
		public btnOffsetSave:Laya.Button;
		public chkFrameMv:Laya.CheckBox;
		public txtFramex:Laya.TextInput;
		public txtFramey:Laya.TextInput;
		public effectpanel:Laya.Panel;
		public btnEffSave:Laya.Button;
		public btnEffReset:Laya.Button;
		public chkEffect:Laya.CheckBox;
		public cbbEffect:Laya.ComboBox;
		public chkHit:Laya.CheckBox;
		public cbbHit:Laya.ComboBox;
		public chkBlank:Laya.CheckBox;
		public txtHitX:Laya.TextInput;
		public txtHitY:Laya.TextInput;
		public chkFire:Laya.CheckBox;
		public txtFireX:Laya.TextInput;
		public txtFireY:Laya.TextInput;
		public lblUdef:Laya.TextInput;
		public grpLayer:Laya.RadioGroup;
		public chkFollow:Laya.CheckBox;
		public panelshow:Laya.Panel;
		public cbbModel:Laya.ComboBox;
		public lblHitXY:laya.display.Text;
		public inpanel:Laya.Panel;
		public cbbConf:Laya.ComboBox;
		public btnOther:Laya.Button;
		public outpanel:Laya.Panel;
		public btnAtlas:Laya.Button;
		public btnAE:Laya.Button;
		public btnConf:Laya.Button;
		public txtCurAni:laya.display.Text;
        constructor(){ super()}
        createChildren():void {
            super.createChildren();
            this.loadScene("scene/AttrPanel");
        }
    }
    REG("ui.scene.AttrPanelUI",AttrPanelUI);
    export class FramePanelUI extends Scene {
		public framepanel:Laya.Panel;
		public frameMenu:Laya.Panel;
		public cbBlank:Laya.ComboBox;
		public btnBlank:Laya.Button;
		public cbCopy:Laya.ComboBox;
		public btnCopy:Laya.Button;
		public btnInsert:Laya.Button;
		public btnPlay:Laya.Button;
		public btnStop:Laya.Button;
		public chkselect:Laya.CheckBox;
		public chkLoop:Laya.CheckBox;
		public btnFrameReset:Laya.Button;
		public btnFrameSave:Laya.Button;
		public listAniName:Laya.List;
		public frameListPanel:Laya.Panel;
		public listgradua:Laya.List;
		public lblGradua:Laya.Label;
		public listActAni:Laya.List;
		public listFrame:Laya.List;
		public txtFrame:Laya.Label;
		public imgSelectAll:Laya.Image;
		public cursor:Laya.Panel;
        constructor(){ super()}
        createChildren():void {
            super.createChildren();
            this.loadScene("scene/FramePanel");
        }
    }
    REG("ui.scene.FramePanelUI",FramePanelUI);
    export class StagePanelUI extends Laya.Scene {
		public ani1:Laya.FrameAnimation;
		public tab1:Laya.Panel;
		public imagepanel:Laya.Panel;
		public imgBG:Laya.Image;
		public container:Laya.Panel;
		public coordinateX:Laya.Image;
		public coordinateY:Laya.Image;
		public leftpanel:any;
		public rightpanel:any;
		public framepanel:any;
        constructor(){ super()}
        createChildren():void {
            super.createChildren();
            this.loadScene("scene/StagePanel");
        }
    }
    REG("ui.scene.StagePanelUI",StagePanelUI);
}