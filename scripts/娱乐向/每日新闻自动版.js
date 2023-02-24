// ==UserScript==
// @name         每日新闻
// @author       SzzRain
// @version      1.0.2
// @description  自动发送每日新闻 （使用 .dailynews help 查看详情）
// @timestamp    1673851633
// @license      MIT
// @homepageURL  https://github.com/Szzrain
// ==/UserScript==
function dailynewsrun(args) {
    let url = "http://bjb.yunwj.top/php/tp/lj.php";
    let ctx = args[0];
    let msg = args[1];
    let isTp1 = args[2];
    // 发送 GET 请求
    fetch(url)
        .then((response) => {
            // 判断响应状态码是否为 200
            if (response.ok) {
                return response.text();
            } else {
                console.log(response.status);
                console.log("api失效！");
                return "api失效！"
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
            return "api请求错误！错误原因：" + error
        });
    return "function call unspecified error";
}
if (!seal.ext.find('dailynews')) {
    const chatmap = new Map();
    const ext = seal.ext.new('dailynews', 'SzzRain', '1.0.2');
    // 创建一个命令
    const cmdDailynews = seal.ext.newCmdItemInfo();
    cmdDailynews.name = 'dailynews';
    cmdDailynews.help = '使用 .dailynews on (时间) 来打开每日新闻 使用 .dailynews off 来关闭';
    cmdDailynews.solve = (ctx, msg, cmdArgs) => {
        let TimerExt = seal.ext.find('定时任务')
        if ((!TimerExt) || TimerExt.author !== "SzzRain" || TimerExt.version !== "1.1.9") {
            seal.replyToSender(ctx, msg, "定时任务插件未安装，请安装 定时任务.js（ver 1.1.9） by SzzRain 来使用此插件的功能，如果你的定时任务插件版本更高，请更新此插件")
            return seal.ext.newCmdExecuteResult(true);
        }
        let val = cmdArgs.getArgN(1)
        switch (val) {
            case 'help': {
                const ret = seal.ext.newCmdExecuteResult(true);
                ret.showHelp = true;
                return ret;
            }
            case "on": {
                if (msg.messageType === "group") {
                    if (chatmap.has(msg.groupId)) {
                        seal.replyToSender(ctx, msg, "每日新闻已经开启")
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    let msgTaskArgs = [ctx,msg,false];
                    let task = globalThis.timer.joinTaskDaily(ctx, dailynewsrun, msgTaskArgs,null, parseFloat(cmdArgs.getArgN(2)), -10)
                    chatmap.set(msg.groupId, task)
                    seal.replyToSender(ctx, msg, "每日新闻功能已在当前群组启动")
                    return seal.ext.newCmdExecuteResult(true);
                } else if (msg.messageType === "private") {
                    if (chatmap.has(msg.sender.userId)) {
                        seal.replyToSender(ctx, msg, "每日新闻已经开启")
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    let msgTaskArgs = [ctx,msg,false];
                    let task = globalThis.timer.joinTaskDaily(ctx, dailynewsrun, msgTaskArgs,null, parseFloat(cmdArgs.getArgN(2)), -10)
                    TaskTimer.__instance.run()
                    chatmap.set(msg.sender.userId, task)
                    seal.replyToSender(ctx, msg, "每日新闻功能已启动")
                    return seal.ext.newCmdExecuteResult(true);
                }
                break
            }
            case "off": {
                let id
                if (msg.messageType === "group") {
                    id = msg.groupId
                } else if (msg.messageType === "private") {
                    id = msg.sender.userId
                }
                if (chatmap.has(id)) {
                    let result = globalThis.timer.delTaskWithCheck(ctx, chatmap.get(id)["id"])
                    if (result === "删除成功") {
                        chatmap.delete(id)
                        seal.replyToSender(ctx, msg, "成功关闭每日新闻")
                    } else if (result === "id对应的任务不存在或已经被删除") {
                        chatmap.delete(id)
                        seal.replyToSender(ctx, msg, "关闭每日新闻失败，" + result)
                    } else {
                        seal.replyToSender(ctx, msg, "关闭每日新闻失败，" + result)
                    }
                } else {
                    seal.replyToSender(ctx, msg, "每日新闻在当前聊天中并未开启，如果你确认任务已经开启，请使用定时任务插件的功能删除该聊天内的任务（.定时任务 help）")
                }
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

    // 注册扩展
    seal.ext.register(ext);
}
