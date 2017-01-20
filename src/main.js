/* eslint-disable */
'use strict';

const path = require('path');
const {app, ipcMain} = require('electron');

const UpdateHandler = require('./handlers/update');
const Common = require('./common');

const SplashWindow = require('./windows/controllers/splash');
const WeChatWindow = require('./windows/controllers/wechat');
const AppTray = require('./windows/controllers/app_tray');

class ElectronicWeChat {
    constructor() {
        this.wechatWindow = null;
        this.splashWindow = null;
        this.tray = null;
    }

    init() {
        this.initApp();
        this.initIPC();
    }

    initApp() {//主界面
        //when Electron has finished initializing
        app.on('ready', ()=> {
            this.createWeChatWindow();
        });
        //which usually happens when the user clicks on the application’s dock icon.
        app.on('activate', () => {
            if (this.wechatWindow == null) {
                this.createWeChatWindow();
            } else {
                this.wechatWindow.show();
            }
        });
        app.on('closed', function() {
            this.wechatWindow.close();
        });
    };

    initIPC() { //loading界面
        ipcMain.on('reload', (event, message) => {
            this.wechatWindow.loadURL(Common.WEB_WECHAT);
        });
    };

    //创建各种窗口
    createTray() {
        this.tray = new AppTray(this.splashWindow, this.wechatWindow);
    }
    createSplashWindow() {
        this.splashWindow = new SplashWindow();
        this.splashWindow.show();
    }
    createWeChatWindow() {
        this.wechatWindow = new WeChatWindow();
    }
}

new ElectronicWeChat().init();
