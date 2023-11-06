// ==UserScript==
// @name         每日新闻
// @author       SzzRain
// @version      2.0.0
// @description  自动发送每日新闻 （使用 .dailynews help 查看详情）
// @timestamp    1699238527
// @license      MIT
// @homepageURL  https://github.com/Szzrain
// ==/UserScript==
function getCtxAndMsgById(epId, guildId, groupId, userId, isPrivate) {
    let eps = seal.getEndPoints();
    for (let i = 0; i < eps.length; i++) {
        if (eps[i].userId === epId) {
            let msg = seal.newMessage();
            if (isPrivate === true) {
                msg.messageType = "private";
            } else {
                msg.messageType = "group";
                msg.groupId = groupId;
                msg.guildId = guildId;
            }
            msg.sender.userId = userId;
            return [seal.createTempCtx(eps[i], msg), msg];
        }
    }
    return undefined;
}
function dailynewsrun(epId, guildId, groupId, userId, isPrivate) {
    let url = "http://bjb.yunwj.top/php/tp/lj.php";
    let args = getCtxAndMsgById(epId, guildId, groupId, userId, isPrivate);
    let ctx = args[0];
    let msg = args[1];
    let isTp1 = true;
    // 发送 GET 请求
    fetch(url)
        .then((response) => {
            // 判断响应状态码是否为 200
            if (response.ok) {
                return response.text();
            } else {
                console.log(response.status);
                console.log("api失效！");
                return "api失效！";
            }
        })
        .then((data) => {
            //返回数据转换为json对象以可以访问
            let imgJson = JSON.parse(data);
            // 使用[""]方式访问json对象中的tp项
            let imgUrl = imgJson["tp"];
            if (isTp1 === true) {
                imgUrl = imgJson["tp1"];
            }
            // 拼装返回的图片消息
            let messageRet = "[图:" + imgUrl + "]";
            // 发出去
            seal.replyToSender(ctx, msg, messageRet);
            return null;
        })
        .catch((error) => {
            console.log("api请求错误！错误原因：" + error);
            return "api请求错误！错误原因：" + error;
        });
    return "function call unspecified error";
}

if (!seal.ext.find('dailynews')) {
    const chatmap = new Map();
    let TimerExt = seal.ext.find('定时任务');
    if ((!TimerExt) || TimerExt.author !== "SzzRain" || TimerExt.version !== "2.0.0") {
        console.error("定时任务插件未安装或版本不符合要求，每日新闻插件无法使用，\n请安装 定时任务.js（ver 2.0.0） by SzzRain 来使用此插件的功能，如果你的定时任务插件版本更高，请更新此插件");
    } else {
        const ext = seal.ext.new('dailynews', 'SzzRain', '2.0.0');
        // 注册扩展
        seal.ext.register(ext);
        globalThis.dailynewsMap = new Map(Object.entries(JSON.parse(ext.storageGet("dailynewsMap") || "{}")));
        for (let [key, value] of globalThis.dailynewsMap) {
            try {
                let args = value.slice(0, 5);
                let ctx = getCtxAndMsgById(...args)[0];
                let task = globalThis.timer.joinTaskDaily(ctx, dailynewsrun, null, parseFloat(value[5]),-10, ...args);
                globalThis.timer.run();
                chatmap.set(key, task);
            } catch (e) {
                console.error(e);
            }
        }
        // 创建一个命令
        const cmdDailynews = seal.ext.newCmdItemInfo();
        cmdDailynews.name = 'dailynews';
        cmdDailynews.help = '使用 .dailynews on (时间) 来打开每日新闻 使用 .dailynews off 来关闭\n'
            + '时间参数为每日新闻发送的时间，格式为 24 小时制的时间转换为小数，例如 .dailynews on 8.5 为每天早上8点30分发送';
        cmdDailynews.solve = (ctx, msg, cmdArgs) => {
            let val = cmdArgs.getArgN(1);
            switch (val) {
                case 'help': {
                    const ret = seal.ext.newCmdExecuteResult(true);
                    ret.showHelp = true;
                    return ret;
                }
                case "on": {
                    if (msg.messageType === "group") {
                        if (chatmap.has(msg.groupId)) {
                            seal.replyToSender(ctx, msg, "每日新闻已经开启");
                            return seal.ext.newCmdExecuteResult(true);
                        }
                        let taskArgs = [ctx.endPoint.userId, msg.guildId, msg.groupId, msg.sender.userId, (msg.messageType === "private"), parseFloat(cmdArgs.getArgN(2))];
                        let task = globalThis.timer.joinTaskDaily(ctx, dailynewsrun,null, parseFloat(cmdArgs.getArgN(2)), -10, ctx.endPoint.userId, msg.guildId, msg.groupId, msg.sender.userId, (msg.messageType === "private"));
                        globalThis.timer.run();
                        chatmap.set(msg.groupId, task);
                        globalThis.dailynewsMap.set(msg.groupId, taskArgs);
                        ext.storageSet("dailynewsMap", JSON.stringify(Object.fromEntries(globalThis.dailynewsMap)));
                        seal.replyToSender(ctx, msg, "每日新闻功能已在当前群组启动");
                        return seal.ext.newCmdExecuteResult(true);
                    } else if (msg.messageType === "private") {
                        if (chatmap.has(msg.sender.userId)) {
                            seal.replyToSender(ctx, msg, "每日新闻已经开启");
                            return seal.ext.newCmdExecuteResult(true);
                        }
                        let taskArgs = [ctx.endPoint.userId, msg.guildId, msg.groupId, msg.sender.userId, (msg.messageType === "private"), parseFloat(cmdArgs.getArgN(2))];
                        let task = globalThis.timer.joinTaskDaily(ctx, dailynewsrun,null, parseFloat(cmdArgs.getArgN(2)), -10, ctx.endPoint.userId, msg.guildId, msg.groupId, msg.sender.userId, (msg.messageType === "private"));
                        globalThis.timer.run();
                        chatmap.set(msg.sender.userId, task);
                        globalThis.dailynewsMap.set(msg.groupId, taskArgs);
                        ext.storageSet("dailynewsMap", JSON.stringify(Object.fromEntries(globalThis.dailynewsMap)));
                        seal.replyToSender(ctx, msg, "每日新闻功能已启动");
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    break;
                }
                case "off": {
                    let id;
                    if (msg.messageType === "group") {
                        id = msg.groupId;
                    } else if (msg.messageType === "private") {
                        id = msg.sender.userId;
                    }
                    if (chatmap.has(id)) {
                        let result = globalThis.timer.delTaskWithCheck(ctx, chatmap.get(id)["id"]);
                        if (result === "删除成功") {
                            chatmap.delete(id);
                            seal.replyToSender(ctx, msg, "成功关闭每日新闻");
                        } else if (result === "id对应的任务不存在或已经被删除") {
                            chatmap.delete(id);
                            seal.replyToSender(ctx, msg, "关闭每日新闻失败，" + result);
                        } else {
                            seal.replyToSender(ctx, msg, "关闭每日新闻失败，" + result);
                        }
                    } else {
                        seal.replyToSender(ctx, msg, "每日新闻在当前聊天中并未开启，如果你确认任务已经开启，请使用定时任务插件的功能删除该聊天内的任务（.定时任务 help）");
                    }
                    return seal.ext.newCmdExecuteResult(true);
                }
                case "list": {
                    if (ctx.privilegeLevel < 100) {
                        seal.replyToSender(ctx, msg, "你没有权限使用此命令");
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    let ret = "当前已开启的每日新闻任务（任务id: 群组/个人id 时间 ）：\n";
                    for (let [key, value] of chatmap) {
                        ret += `${value["id"]}: ${key} ${value["timing"]}\n`;
                    }
                    seal.replyToSender(ctx, msg, ret);
                    return seal.ext.newCmdExecuteResult(true);
                }
                case "reset": {
                    if (ctx.privilegeLevel < 100) {
                        seal.replyToSender(ctx, msg, "你没有权限使用此命令");
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    for (let [key, value] of chatmap) {
                        globalThis.timer.delTaskWithCheck(ctx, value["id"]);
                    }
                    chatmap.clear();
                    globalThis.dailynewsMap = new Map();
                    ext.storageSet("dailynewsMap", JSON.stringify(Object.fromEntries(globalThis.dailynewsMap)));
                    seal.replyToSender(ctx, msg, "已重置每日新闻任务列表");
                    return seal.ext.newCmdExecuteResult(true);
                }
                default: {
                    seal.replyToSender(ctx, msg, "未知的参数，使用 .dailynews help 查看使用说明");
                }
            }
            return seal.ext.newCmdExecuteResult(true);
        }
        // 注册命令
        ext.cmdMap['dailynews'] = cmdDailynews;
    }
}