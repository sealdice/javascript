// ==UserScript==
// @name         基于OepnAI SDK的聊天插件
// @author       梓漪
// @version      1.0.0
// @description  接入AI模型，和Bot普普通通地聊天
// @timestamp    1739102145
// 2025-02-09
// @license      MIT License
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

const callAI = (route, dict, callback) => {
    fetch(`http://127.0.0.1:13211/${route}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: dict.user_id,
            group_id: dict.group_id || null,
            bot_id: dict.bot_id || '10001',
            nickname: dict.nickname || '用户',
            botname: dict.botname || '海豹',
            content: dict.content,
            img_url: dict.img_url || null
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 200) {
            callback({ err: 0, msg: data.message });
        } else {
            callback({ err: data.code, msg: data.message });
        }
    })
    .catch(error => {
        console.error('Error: ', error);
        callback({ err: 504, msg: "呜...AI好像出了点问题，等会再试试吧" });
    });
};

if (!seal.ext.find('aichat')) {
    const ext = seal.ext.new('aichat', '梓漪', '1.0.0');

    const cmdAsk = seal.ext.newCmdItemInfo();
    cmdAsk.name = 'ask';
    cmdAsk.help = '无上下文的AI聊天，用法：.ask <内容>';
    
    cmdAsk.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1);
        switch (val) {
            case 'help': {
                const ret = seal.ext.newCmdExecuteResult(true);
                ret.showHelp = true;
                return ret;
            }
            default: {
                let atSender = ctx.isPrivate ? '' : `对<${ctx.player.name}>：`;
                if (!val) {
                    seal.replyToSender(ctx, msg, `${atSender}内容不能为空！`);
                    return seal.ext.newCmdExecuteResult(true);
                }
                let dict = {
                    nickname: ctx.player.name,
                    botname: ctx.endPoint.nickname,
                    content: val,
                }
                seal.replyToSender(ctx, msg, `${atSender}${ctx.endPoint.nickname}正在思考中...`);
                callAI('ask', dict, (result) => {
                    seal.replyToSender(ctx, msg, atSender+result.msg);
                });
                return seal.ext.newCmdExecuteResult(true);
            }
        }
    }
    
    const cmdChat = seal.ext.newCmdItemInfo();
    cmdChat.name = 'chat';
    cmdChat.help = '有上下文的AI聊天，用法：.chat <内容>';
    
    cmdChat.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1);
        switch (val) {
            case 'help': {
                const ret = seal.ext.newCmdExecuteResult(true);
                ret.showHelp = true;
                return ret;
            }
            default: {
                let atSender = ctx.isPrivate ? '' : `对<${ctx.player.name}>：`;
                if (!val) {
                    seal.replyToSender(ctx, msg, `${atSender}内容不能为空！`);
                    return seal.ext.newCmdExecuteResult(true);
                }
                let dict = {
                    user_id: ctx.player.userId,
                    group_id: ctx.isPrivate ? null : ctx.group.groupId,
                    bot_id: ctx.endPoint.userId,
                    nickname: ctx.player.name,
                    botname: ctx.endPoint.nickname,
                    content: val,
                }
                seal.replyToSender(ctx, msg, `${atSender}${ctx.endPoint.nickname}正在思考中...`);
                callAI('chat', dict, (result) => {
                    seal.replyToSender(ctx, msg, atSender+result.msg);
                });
                return seal.ext.newCmdExecuteResult(true);
            }
        }
    }
    
    const cmdAIClear = seal.ext.newCmdItemInfo();
    cmdAIClear.name = 'aiclear';
    cmdAIClear.help = '清除AI聊天记录，用法：.aiclear';
    
    cmdAIClear.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1);
        switch (val) {
            case 'help': {
                const ret = seal.ext.newCmdExecuteResult(true);
                ret.showHelp = true;
                return ret;
            }
            default: {
                let atSender = ctx.isPrivate ? '' : `对<${ctx.player.name}>：`;
                let dict = {
                    user_id: ctx.player.userId,
                    group_id: ctx.isPrivate ? null : ctx.group.groupId,
                    bot_id: ctx.endPoint.userId,
                }
                callAI('aiclear', dict, (result) => {
                    seal.replyToSender(ctx, msg, atSender+result.msg);
                });
                return seal.ext.newCmdExecuteResult(true);
            }
        }
    }
    
    ext.cmdMap['ask'] = cmdAsk;
    ext.cmdMap['chat'] = cmdChat;
    ext.cmdMap['aiclear'] = cmdAIClear;
    
    seal.ext.register(ext);
}
