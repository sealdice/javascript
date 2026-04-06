// ==UserScript==
// @name         SealDiceAIroleplay
// @author       Lelia
// @version      1.0.0
// @description  为海豹骰设计的 AI 角色扮演回复插件 | Vibe coded by Claude, conceived by Lelia.
// @timestamp    1700000000
// @license      Apache-2
// @homepageURL  https://github.com/Lelia7OR/SealDiceAIroleplay
// ==/UserScript==

// ===== 配置区 =====
// ⚠️ 以下三项请按你的实际情况修改
const FLASK_URL = 'http://你的IP:5000/chat';  // Flask 服务地址，必填
const COMMAND_NAME = 'hekate';                // 指令名，玩家用 .指令名 触发，必填
const CHAR_NAME = '赫卡特';                   // 角色名，仅用于提示语显示，必填
// ==================

// ===== 提示语，可按喜好修改 =====
const WAIT_MSG = `${CHAR_NAME}听见了你，请等待她的回音。`;   // 可删除，但强烈推荐保留，便于排查问题
const ERROR_MSG = `${CHAR_NAME}暂时无法回应，请稍后再试。`; // 可修改
// ================================

// ⚠️ 以下内容为逻辑部分，请勿修改
let ext = seal.ext.find(COMMAND_NAME);
if (!ext) {
    ext = seal.ext.new(COMMAND_NAME, 'Lelia', '1.0.0');
    seal.ext.register(ext);
}

const cmd = seal.ext.newCmdItemInfo();
cmd.name = COMMAND_NAME;
cmd.help = `和${CHAR_NAME}对话，例如：.${COMMAND_NAME} 你好`;
cmd.solve = (ctx, msg, cmdArgs) => {
    const userMessage = cmdArgs.rawArgs;
    if (!userMessage) {
        seal.replyToSender(ctx, msg, `请输入你想说的话，例如：.${COMMAND_NAME} 你好`);
        return seal.ext.newCmdExecuteResult(true);
    }

    const playerName = ctx.player.name;

    seal.replyToSender(ctx, msg, WAIT_MSG);

    fetch(FLASK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, playerName: playerName })
    })
    .then(res => res.json())
    .then(data => { seal.replyToSender(ctx, msg, data.reply); })
    .catch(err => { seal.replyToSender(ctx, msg, ERROR_MSG); });

    return seal.ext.newCmdExecuteResult(true);
};

ext.cmdMap[COMMAND_NAME] = cmd;
