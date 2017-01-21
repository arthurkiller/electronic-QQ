/**
 * Created by Zhongyi on 5/2/16.
 * Modify by arthur @ 21/1/17
 */
'use strict';

const path = require('path');
const { app, shell, BrowserWindow } = require('electron');
const Common = require('../../common');

const CSSInjector = require('../../inject/css');
const MessageHandler = require('../../handlers/message');
const UpdateHandler = require('../../handlers/update');

//主窗口？
class WeChatWindow {
    constructor() {
        this.loginState = { NULL: -2, WAITING: -1, YES: 1, NO: 0 };
        this.loginState.current = this.loginState.NULL; //初始化设置为NULL
        this.inervals = {};
        this.createWindow();
    }

    resizeWindow(isLogged, splashWindow) {
        //根据login状态调整窗口大小，窗口大小不能自主调整，是固定的
        const size = isLogged ? Common.WINDOW_SIZE : Common.WINDOW_SIZE_LOGIN;

        this.wechatWindow.setResizable(isLogged);
        this.wechatWindow.setSize(size.width, size.height);
        if (this.loginState.current === 1 - isLogged || this.loginState.current === this.loginState.WAITING) {
            splashWindow.hide();
            this.wechatWindow.show();
            this.wechatWindow.center();
            this.loginState.current = isLogged;
        }
    }

    createWindow() {
        this.wechatWindow = new BrowserWindow({
            title: Common.ELECTRONIC_QQ,
            height: 900,
            width: 1440,
            center: true,
            show: true,
            frame: true,
            icon: path.join(__dirname, '../../../assets/icon.png'),
            webPreferences: {
                javascript: true,
                webSecurity: true,
                allowDisplayingInsecureContent: true,
                allowRunInsecureContent: true,
                plugins: true,
                nodeIntegration: true,
            },
        });

        this.wechatWindow.webContents.setUserAgent(Common.USER_AGENT);
        if (Common.DEBUG_MODE) {
            this.wechatWindow.webContents.openDevTools();
        }

        this.connect();

        this.wechatWindow.webContents.on('will-navigate', (ev, url) => {
            if (/(.*wx.*\.qq\.com.*)|(web.*\.wechat\.com.*)/.test(url)) return;
            ev.preventDefault();
        });

        this.wechatWindow.on('close', (e) => {
            if (this.wechatWindow.isVisible()) {
                e.preventDefault();
                this.wechatWindow.hide();
            }
        });

        this.wechatWindow.on('page-title-updated', (ev) => {
            if (this.loginState.current === this.loginState.NULL) {
                this.loginState.current = this.loginState.WAITING;
            }
            ev.preventDefault();
        });

        this.wechatWindow.webContents.on('dom-ready', () => {
            this.wechatWindow.webContents.insertCSS(CSSInjector.commonCSS);
            if (process.platform === 'darwin') {
                this.wechatWindow.webContents.insertCSS(CSSInjector.osxCSS);
            }

            if (!UpdateHandler.CHECKED) {
                new UpdateHandler().checkForUpdate(`v${app.getVersion()}`, true);
            }
        });

        this.wechatWindow.webContents.on('new-window', (event, url) => {
            event.preventDefault();
            shell.openExternal(new MessageHandler().handleRedirectMessage(url));
        });

        this.wechatWindow.webContents.on('will-navigate', (event, url) => {
            if (url.endsWith('/fake')) event.preventDefault();
        });
    }

    loadURL(url) {
        this.wechatWindow.loadURL(url);
    }

    show() {
        this.wechatWindow.show();
    }

    connect() {
        this.loadURL(Common.WEB_QQ);
        console.log('Connectted');
    }
}

module.exports = WeChatWindow;
