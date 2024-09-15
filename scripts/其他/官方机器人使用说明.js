// ==UserScript==
// @name         骰子官方机器人使用说明
// @author       凤吹风雪
// @version      1.0.0
// @description  简短的跟有骰娘使用基础的玩家介绍官方机器人骰娘的使用方法，在流溪佬的dissmiss彩蛋插件基础上改出
// @license      Apache-2
// ==/UserScript==
let ext = seal.ext.find('官方机器人手册')
if (!ext){
    ext = seal.ext.new('官方机器人手册','凤吹风雪','1.0.0')
    seal.ext.register(ext)
}
var cmdDissmiss = seal.ext.newCmdItemInfo();
cmdDissmiss.name = '官方机器人手册'
cmdDissmiss.solve = (ctx, msg, cmdArgs) => {
    let nickName = msg.sender.nickname;
    seal.replyToSender(ctx, msg, `使用官方机器人时，除了使用时开头要@官方机器人之外，官方机器人的指令跟一般骰子并无不同，大部分指令与功能都可以实现。无法实现的功能有，开启记录log，暗投，跨群绑卡。
    当前还没配消息列表，故无法跟官方机器人私聊。`)
    return seal.ext.newCmdExecuteResult(true)
}
ext.cmdMap['官方机器人手册'] = cmdDissmiss;