import { globalDao, cmmAniConf, aniEntityDict } from '../cmm/render-dao';
import AniEntity from '../cmm/AniEntity';
import AttrPanel from './AttrPanel';
import { ipcRenderer, remote, shell } from 'electron';

let confNames = "不使用配置";
let cbbConf: Laya.ComboBox;
let txtCurAni: Laya.Text;
export function aniSaveHandle(editor: AttrPanel) {
    let btnAE = editor.btnAE;
    btnAE.toolTip = '导出AE';
    btnAE.on(Laya.Event.CLICK, null, onBtnAEClick);

    let btnAtlas = editor.btnAtlas;
    btnAtlas.toolTip = '导出图集';
    btnAtlas.on(Laya.Event.CLICK, null, onBtnAtlasClick);

    let btnConf = editor.btnConf;
    btnConf.toolTip = '导出配置';
    btnConf.on(Laya.Event.CLICK, null, onBtnConfClick);

    let btnOther = editor.btnOther;
    btnOther.on(Laya.Event.CLICK, null, onBtnReadConf);

    cbbConf = editor.cbbConf;
    cbbConf.selectHandler = Laya.Handler.create(null, onCbbConf, [cbbConf], false);

    txtCurAni = editor.txtCurAni;

    ipcRenderer.send('read-ani-confs');

    ipcRenderer.on('selected-ani-conf', (event, fileName, framesDataStr) => {

        if (globalDao.curAniName == '') return;
        let aniEntity: AniEntity = <AniEntity>aniEntityDict.get(globalDao.curAniName);
        aniEntity.setConfEffect(fileName, <FrameEffect[]>JSON.parse(framesDataStr));
    });

    ipcRenderer.on('load-ani-conf', (event, fileName, framesDataStr) => {
        addConf(fileName, framesDataStr);
    });


    //保存ae成功
    ipcRenderer.on('save-ae-succ', (event, aniName, savePath) => {

        let index = remote.dialog.showMessageBoxSync({
            type: 'info',
            title: 'AE导出',
            message: `AE导出完成: ${aniName} `,
            buttons: ['前往', '取消'],
            cancelId: 2
        });
        if (index == 0) {
            shell.openItem(savePath)
        }
    });


    //保存图集成功
    ipcRenderer.on('save-atlas-succ', (event, aniName, savePath) => {
        let index = remote.dialog.showMessageBoxSync({
            type: 'info',
            title: '图集打包',
            message: `图集打包成功: ${aniName} `,
            buttons: ['前往', '取消'],
            cancelId: 2
        });
        if (index == 0) {
            shell.openItem(savePath)
        }
    });

    ipcRenderer.on('save-atlas-fail', (event, err) => {
        remote.dialog.showErrorBox('打包失败', err);
    });
}

export function setConfName(confName: string) {
    if (cbbConf.labels.indexOf(confName) < 0) return;
    if (confName == '') {
        cbbConf.selectedIndex = 0;
    } else {
        cbbConf.selectedLabel = confName;
    }
}

export function addConf(confName: string, framesDataStr: string) {
    if (!cmmAniConf.get(confName)) {
        confNames = confNames + ',' + confName
    }
    cmmAniConf.set(confName, <FrameEffect[]>JSON.parse(framesDataStr));

    let selectedIndex = cbbConf.selectedIndex;
    if (selectedIndex == -1) selectedIndex = 0;
    cbbConf.labels = confNames;
    cbbConf.selectedIndex = selectedIndex;
}

export function setTxtCurAniName(val: string) {
    txtCurAni.text = val;
}

function onBtnAEClick() {
    if (globalDao.curAniName == '') return;
    let aniEntity: AniEntity = <AniEntity>aniEntityDict.get(globalDao.curAniName);
    ipcRenderer.send('save-ae', globalDao.curAniName, aniEntity.frameEffects);
}

function onBtnAtlasClick() {
    if (globalDao.curAniName == '') return;
    let aniEntity: AniEntity = <AniEntity>aniEntityDict.get(globalDao.curAniName);
    aniEntity.saveFramesData();
    ipcRenderer.send('save-atlas', globalDao.curAniName, aniEntity.frameEffects);
}

function onBtnConfClick() {
    if (globalDao.curAniName == '') return;
    let aniEntity: AniEntity = <AniEntity>aniEntityDict.get(globalDao.curAniName);
    ipcRenderer.send('save-ani-file', globalDao.curAniName, aniEntity.frameEffects);
    addConf(globalDao.curAniName, JSON.stringify(aniEntity.frameEffects))
}

function onBtnReadConf() {
    ipcRenderer.send('read-ani-conf-dialog');
}

function onCbbConf(cb: Laya.ComboBox) {
    if (globalDao.curAniName == '') return;
    let aniEntity: AniEntity = <AniEntity>aniEntityDict.get(globalDao.curAniName);
    if (cb.selectedIndex > 0) {
        aniEntity.setCmmEffect(cb.selectedLabel);
    } else {
        aniEntity.setCmmEffect('');
    }
}