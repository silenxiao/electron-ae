"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Scene = Laya.Scene;
var REG = Laya.ClassUtils.regClass;
var ui;
(function (ui) {
    var scene;
    (function (scene) {
        class AniListPanelUI extends Scene {
            constructor() { super(); }
            createChildren() {
                super.createChildren();
                this.loadScene("scene/AniListPanel");
            }
        }
        scene.AniListPanelUI = AniListPanelUI;
        REG("ui.scene.AniListPanelUI", AniListPanelUI);
        class AttrPanelUI extends Scene {
            constructor() { super(); }
            createChildren() {
                super.createChildren();
                this.loadScene("scene/AttrPanel");
            }
        }
        scene.AttrPanelUI = AttrPanelUI;
        REG("ui.scene.AttrPanelUI", AttrPanelUI);
        class FramePanelUI extends Scene {
            constructor() { super(); }
            createChildren() {
                super.createChildren();
                this.loadScene("scene/FramePanel");
            }
        }
        scene.FramePanelUI = FramePanelUI;
        REG("ui.scene.FramePanelUI", FramePanelUI);
        class StagePanelUI extends Scene {
            constructor() { super(); }
            createChildren() {
                super.createChildren();
                this.loadScene("scene/StagePanel");
            }
        }
        scene.StagePanelUI = StagePanelUI;
        REG("ui.scene.StagePanelUI", StagePanelUI);
    })(scene = ui.scene || (ui.scene = {}));
})(ui = exports.ui || (exports.ui = {}));
