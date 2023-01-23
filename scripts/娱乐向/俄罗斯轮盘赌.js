"use strict";
// ==UserScript==
// @name         俄罗斯轮盘赌
// @author       nao
// @version      0.1.0
// @description  开枪！
// @timestamp    1674126169
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==
exports.__esModule = true;
var ext = seal.ext.find('不是英文');
if (!ext) {
    ext = seal.ext["new"]('不是英文', 'nao', '1.0.0');
    seal.ext.register(ext);
}
var cmd = seal.ext.newCmdItemInfo();
cmd.name = '开枪';
cmd.help = '俄罗斯轮盘赌\n指令：.开枪';
cmd.disabledInPrivate = true;
cmd.solve = function (ctx, msg, argv) {
    var key = cmd.name + msg.groupId;
    var ret = seal.ext.newCmdExecuteResult(true), data = JSON.parse(ext.storageGet(key) || '[]'), text = '>>>\n';
    var rand = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };
    if (argv.getArgN(1) == 'help') {
        ret.showHelp = true;
        return ret;
    }
    if (data.length == 0) {
        seal.replyToSender(ctx, msg, '更换弹夹完成，游戏重新开始。')
        data = Array.from(Array(6), function (v) { return v; });
        data[rand(0, 5)] = 'BOOM!';
    }
    var now = data.shift();
    if (now) {
        text += '你中弹了！BOOM！';
        data = [];
    }
    else {
        text += '存活确认！' + `剩余 ${data.length} 子弹`;
    }
    ext.storageSet(key, JSON.stringify(data));
    seal.replyToSender(ctx, msg, text);
    return ret;
};
ext.cmdMap['开枪'] = cmd;
