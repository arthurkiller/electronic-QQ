/**
 * Created by Zhongyi on 4/12/16.
 */
'use strict';
const { ipcRenderer } = require('electron');

class BadgeCount {
  static init() {
    setInterval(() => {
      let count = 0;
        //对于每个对象，计数并相加
      $('.icon.web_wechat_reddot_middle').each(function () {
        count += parseInt(this.textContent, 10);
      });
        //如果有未读消息，则改变状态
      if (count > 0) {
        ipcRenderer.send('badge-changed', count.toString());
      } else {
        ipcRenderer.send('badge-changed', '');
      }
    }, 1500);
  }
}

module.exports = BadgeCount;
