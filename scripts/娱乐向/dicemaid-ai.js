// ==UserScript==
// @name         AI骰娘
// @author       憧憬少
// @version      1.0.0
// @description  用来给自己的骰娘接入AI，给骰娘注入灵魂，让她可以和你聊天对话（然而不太聪明的样子）
// @timestamp    1676349766
// 2023-2-14 12:42:46
// @license      MIT
// @homepageURL  https://github.com/ChangingSelf/sealdice-js-ext-dicemaid-ai
// ==/UserScript==


"use strict";
exports.__esModule = true;
/**
 * 本部分需要JS扩展的使用者填写自己的参数
 */
//brainshop.ai的api所需参数，注册后即可免费获得
const BID = ''; //填入你的骰娘的大脑的id
const KEY = ''; //填入你的key
const NOT_COMMAND_FLAG = true; //若为true，则可以在@骰娘时不用指令就可以聊天
const QQ = ''; //骰娘自身QQ号（不带“QQ:”前缀，纯数字），用于检查自己是否被@，如果不开启无指令聊天则可以留空。由于海豹没有开放“获取骰娘自身QQ号”的API，所以只能让你们自己填写了
/**
 * 给AI主脑发送消息并接收回复
 * @param ctx 主要是和当前环境以及用户相关的内容，如当前发指令用户，当前群组信息等
 * @param msg 为原生态的指令内容，如指令文本，发送平台，发送时间等
 * @param message 要发送给骰娘的具体消息
 */
function chatWithBot(ctx,msg,message) {
    fetch(`http://api.brainshop.ai/get?bid=${BID}&key=${KEY}&uid=${msg.sender.userId}&msg=${message}`).then(response => {
      if (!response.ok) {
        seal.replyToSender(ctx, msg, `抱歉，我连接不上主脑了。它传递过来的信息是：${response.status}`);
        return seal.ext.newCmdExecuteResult(false);
      } else {
        response.json().then(data => {
          seal.replyToSender(ctx, msg, data["cnt"]);
          return seal.ext.newCmdExecuteResult(true);
        });
        return seal.ext.newCmdExecuteResult(true);
      }
    });
  }
/**
 * 用于实现在被@的时候可以无需指令前缀（“@骰娘 .聊天 聊天内容”变为直接发送“@骰娘 聊天内容”）
 * 如果不需要开启本功能，则在脚本开头将对应变量设置为false
 * @param ext 扩展信息对象
 */
function notCommandChat(ext) {
    ext.onNotCommandReceived = function (ctx, msg) {
        console.log(msg.message);
        let r = /\[CQ:at,qq=(\d+?)\]/.exec(msg.message);
        if (r && r[1] === QQ) {
            //检测到@骰娘时才会回应
            chatWithBot(ctx, msg, msg.message);
        }
    };
}
function main() {
    // 注册扩展
    let ext = seal.ext.find('chat');
    if (!ext) {
        ext = seal.ext["new"]('chat', '憧憬少', '1.0.0');
        if (NOT_COMMAND_FLAG) {
            notCommandChat(ext);
        }
        seal.ext.register(ext);
    }
    // 编写指令
    let cmdSeal = seal.ext.newCmdItemInfo();
    cmdSeal.name = '聊天';
    cmdSeal.help = '.聊天 你要说的内容\n.chat 你要说的内容\n@骰娘 你要说的内容';
    /**
     * 指令核心逻辑
     * @param ctx 主要是和当前环境以及用户相关的内容，如当前发指令用户，当前群组信息等
     * @param msg 为原生态的指令内容，如指令文本，发送平台，发送时间等
     * @param cmdArgs 为指令信息，会将用户发的信息进行分段，方便快速取用
     * @returns seal.CmdExecuteResult，结果对象
     */
    cmdSeal.solve = function (ctx, msg, cmdArgs) {
        let val = cmdArgs.getArgN(1);
        switch (val) {
            //.聊天 help
            case 'help': {
                let ret = seal.ext.newCmdExecuteResult(true);
                ret.showHelp = true;
                return ret;
            }
            //.聊天 聊天内容
            default: {
                if (!val) {
                    seal.replyToSender(ctx, msg, "嗯？你想说什么？"); //<del>“什么?听不清!大点声!根本听不见!重来!”</del>
                    return seal.ext.newCmdExecuteResult(true);
                }
                chatWithBot(ctx, msg, val);
                return seal.ext.newCmdExecuteResult(true);
            }
        }
    };
    // 注册命令
    ext.cmdMap['聊天'] = cmdSeal;
    ext.cmdMap['chat'] = cmdSeal;
}
main();
