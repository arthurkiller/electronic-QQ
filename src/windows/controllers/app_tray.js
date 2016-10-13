/**
 * Created by Zhongyi on 5/2/16.
 *
 * app tray 应该是状态栏的图标和状态相关代码
 */
'use strict';

//加载相关的包
const fs = require('fs');
const path = require('path');
const { app, Menu, nativeImage, Tray } = require('electron');

const Common = require('../../common');

class AppTray {
  constructor(splashWindow, wechatWindow) {
    this.splashWindow = splashWindow;
    this.wechatWindow = wechatWindow;
    this.TRAY_CONFIG_PATH = path.join(app.getPath('appData'),'electronic-wechat/trayConfig.json');
    this.lastUnreadStat = 0;

    //tray相关的配置，如果读取不到就自行创建，默认为白色
    fs.readFile(this.TRAY_CONFIG_PATH, (err, data) => {
      if(err) {
        this.trayColor = 'white';
        fs.writeFile(this.TRAY_CONFIG_PATH, '{"color":"white"}');
      } else {
        this.trayColor = JSON.parse(data.toString()).color;
      }
      this.createTray();
    });
  }

  createTray() {
      //设置tray的图标
    let image;
    if (process.platform === 'linux') {
      image = nativeImage.createFromPath(path.join(__dirname, `../../../assets/tray_${this.trayColor}.png`));
      this.trayIcon = image;
      this.trayIconUnread = nativeImage.createFromPath(path.join(__dirname, `../../../assets/tray_unread_${this.trayColor}.png`));
    } else {
      image = nativeImage.createFromPath(path.join(__dirname, '../../../assets/status_bar.png'));
    }
    image.setTemplateImage(true);
      //创建的tray对象
    this.tray = new Tray(image);
    this.tray.setToolTip(Common.ELECTRONIC_WECHAT);

      //设置
    if (process.platform === 'linux') {
      let contextMenu = Menu.buildFromTemplate([
        { label: 'ChangeIconColor', click: () => this.changeIconColor() },
        { lable: 'Minimize', click: () => this.hideSplashAndShowWeChat() },
          //TODO ：这里可以加一个询问是否退出？
        { label: 'Exit', click: () => app.exit(0) }
      ]);
      this.tray.setContextMenu(contextMenu);
    }
    this.tray.on('click', () => this.hideSplashAndShowWeChat());
  }

  setTitle(title) {
    this.tray.setTitle(title);
  }

  hideSplashAndShowWeChat() {
    if (this.splashWindow.isShown) return;
    this.wechatWindow.show();
  }

    //设置颜色函数，比较奇怪的是为何要把颜色保存到一个json中？？？ TRAY_CONFIG_PATH???
  changeIconColor() {
    if(this.trayColor == 'white') {
      this.trayColor = 'black';
    } else if (this.trayColor == 'black') {
      this.trayColor = 'white';
    }
      //普通图标和unread图标
    this.trayIcon = nativeImage.createFromPath(path.join(__dirname, `../../../assets/tray_${this.trayColor}.png`));
    this.trayIconUnread = nativeImage.createFromPath(path.join(__dirname, `../../../assets/tray_unread_${this.trayColor}.png`));
    if(this.lastUnreadStat === 0) { 
      this.tray.setImage(this.trayIcon);
    } else {
      this.tray.setImage(this.trayIconUnread);
    }
    fs.writeFile(this.TRAY_CONFIG_PATH, `{"color":"${this.trayColor}"}`);
  }

  setUnreadStat(stat) {
      // ==0 表示没有unread 否则显示unread
    if(stat == this.lastUnreadStat) return;
    this.lastUnreadStat = stat;
    if(stat == 0) {
      this.tray.setImage(this.trayIcon);
    } else {
      this.tray.setImage(this.trayIconUnread);
    }
  }
}

module.exports = AppTray;
