// ==UserScript==
// @name         骰主公告插件
// @author       檀轶步棋
// @version      1.1.2
// @timestamp    1676125305
// @description  骰主公开发布公告插件，由海豹群@阿飞 赞助。
// @license      MIT
// ==/UserScript==
let ext = seal.ext.find("billboard");
if (!ext) {
    ext = seal.ext.new("billboard", "檀轶步棋", "1.1.2");
    seal.ext.register(ext);
}
function FormatDate() {
    const DateRaw = new Date();
    return [DateRaw.valueOf().toString(), `${DateRaw.getFullYear().toString()}/${(DateRaw.getMonth() + 1).toString()}/${DateRaw.getDate().toString()} ${DateRaw.getHours().toString()}:${DateRaw.getMinutes().toString()}`];
}
let latestPost = undefined;
class DatabaseManager {
    ctx;
    groupId;
    groupHistory;
    msg;
    looper = 0;
    constructor(ctx, msg) {
        this.ctx = ctx;
        this.msg = msg;
        this.groupId = ctx.group.groupId;
        this.RefreshDatabase();
    }
    Post(str) {
        let dates = FormatDate();
        latestPost = new Object({
            date: dates[1],
            date_raw: dates[0],
            content: str
        });
    }
    CheckAndPost() {
        if (this.groupHistory !== undefined && latestPost !== undefined) {
            if (this.groupHistory[latestPost["date_raw"]] === undefined) {
                this.groupHistory[latestPost["date_raw"]] = [];
            }
            if (this.groupHistory[latestPost["date_raw"]].indexOf(this.groupId) == -1) {
                this.groupHistory[latestPost["date_raw"]].push(this.groupId);
                seal.replyGroup(this.ctx, this.msg, `来自骰主的公告：\n` +
                    `${latestPost["date"]}\n` +
                    `${latestPost["content"]}`);
                ext.storageSet("group", JSON.stringify(this.groupHistory));
                this.RefreshDatabase();
            }
        }
    }
    RefreshDatabase() {
        const ReadData = new Promise(resolve => {
            setTimeout(() => {
                resolve(200);
            }, 800);
            this.groupHistory = JSON.parse(ext.storageGet("group") || "{}");
        });
        ReadData
            .catch(error => {
                throw new Error(error);
            });
    }
}
let cmd = seal.ext.newCmdItemInfo();
cmd.name = "post";
cmd.help = ".post 内容 //发布公告，仅限骰主使用";
cmd.solve = (ctx, msg, args) => {
    switch (ctx.privilegeLevel) {
        case 100: {
            let manager = new DatabaseManager(ctx, msg);
            try {
                manager.Post(args.rawArgs);
            }
            catch (err) {
                console.error(err);
            }
            seal.replyToSender(ctx, msg, "公告将会发送给已经开启骰子，且最近有发言记录的群。");
            break;
        }
        default:
            seal.replyToSender(ctx, msg, "仅有骰主能够发布公告。");
    }
    return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap["post"] = cmd;
const Handle = (ctx, msg) => {
    if (!ctx.isPrivate) {
        let manager = new DatabaseManager(ctx, msg);
        manager.CheckAndPost();
    }
    return seal.ext.newCmdExecuteResult(true);
};
ext.onNotCommandReceived = (ctx, msg) => Handle(ctx, msg);
ext.onCommandReceived = (ctx, msg) => Handle(ctx, msg);
