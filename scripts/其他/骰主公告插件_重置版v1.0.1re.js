// ==UserScript==
// @name         骰主公告插件
// @author       檀轶步棋
// @version      1.0.1-re
// @timestamp    2024-07-03 23:15:30
// @license      MIT
// @description  使用 .post 发布公告，.recall 撤回公告。发布的公告会在 72 小时后自动删除。
// @homepageURL  https://github.com/Verplitic
// ==/UserScript==

let extension = seal.ext.find("announcement");
if (!extension) {
    extension = seal.ext.new("announcement", "檀轶步棋", "1.0.1-re");
    seal.ext.register(extension);
    seal.ext.registerStringConfig(extension, "announceHeader", "来自骰主的公告:", "发送公告的前缀");
}

const commandPost = seal.ext.newCmdItemInfo();
commandPost.name = "post";
commandPost.help =
    "[post 公告内容] 新建公告，公告随后会被发送给有新消息的群组，或在 3 天后自动删除\n" +
        "[post --p 公告内容] 新建加急公告，在普通公告基础上，即使在正在跑团(log 开启)的群内，也会立刻发送公告";
commandPost.solve = (ctx, msg, argv) => {
    const execResult = seal.ext.newCmdExecuteResult(true);
    if (ctx.privilegeLevel < 100 /* owner */) {
        seal.replyToSender(ctx, msg, seal.formatTmpl(ctx, "核心:提示_无权限"));
        return execResult;
    }
    const content = argv.getRestArgsFrom(1);
    const urgent = checkUrgency(argv);
    if (!content) {
        seal.replyToSender(ctx, msg, "请输入公告内容");
        return execResult;
    }
    if (content == "help") {
        execResult.showHelp = true;
        return execResult;
    }
    updateAnnouncement({
        creationTime: new Date().valueOf(),
        content,
        sentGroups: [],
        urgent,
    });
    setTimeout(clearAnnouncement, 259200000 /* 3 days */);
    seal.replyToSender(ctx, msg, "公告已经发送");
    return execResult;
};
extension.cmdMap["post"] = commandPost;

const commandRecall = seal.ext.newCmdItemInfo();
commandRecall.name = "recall";
commandRecall.help = "[recall] 撤回现有的公告";
commandRecall.solve = (ctx, msg, argv) => {
    const execResult = seal.ext.newCmdExecuteResult(true);
    if (argv.getArgN(1) == "help") {
        execResult.showHelp = true;
        return execResult;
    }
    if (ctx.privilegeLevel < 100 /* owner */) {
        seal.replyToSender(ctx, msg, seal.formatTmpl(ctx, "核心:提示_无权限"));
        return execResult;
    }
    clearAnnouncement();
    seal.replyToSender(ctx, msg, "公告已经撤回");
    return execResult;
};
extension.cmdMap["recall"] = commandRecall;

extension.onNotCommandReceived = trigger;
extension.onMessageEdit = trigger;
extension.onMessageDeleted = trigger;
// Edge case: when the received message is a recall command.
extension.onCommandReceived = (ctx, msg, argv) => {
    if (ctx.isPrivate) {
        return;
    }
    const announce = currentAnnouncement();
    if (!announce || (!announce.urgent && ctx.group.logOn) || announce.sentGroups.includes(msg.groupId)) {
        return;
    }
    if (argv.command != "recall") {
        seal.replyGroup(ctx, msg, formatAnnouncement(announce));
        announce.sentGroups.push(msg.groupId);
        updateAnnouncement(announce);
    }
};

function trigger(ctx, msg) {
    if (ctx.isPrivate) {
        return;
    }
    const announce = currentAnnouncement();
    if (!announce || (!announce.urgent && ctx.group.logOn) || announce.sentGroups.includes(msg.groupId)) {
        return;
    }
    seal.replyGroup(ctx, msg, formatAnnouncement(announce));
    announce.sentGroups.push(msg.groupId);
    updateAnnouncement(announce);
}

function formatAnnouncement(announce) {
    const header = seal.ext.getStringConfig(extension, "announceHeader");
    const time = formatTime(new Date(announce.creationTime));
    const priority = announce.urgent ? "高优先级" : "低优先级";
    return `${header}\n${announce.content}\n\n发布于 ${time}, ${priority}`;
}

function checkUrgency(argv) {
    const arg = argv.getKwarg("p");
    return !!arg;
}

function currentAnnouncement() {
    const str = extension.storageGet("announcement");
    if (str == "") {
        return undefined;
    }
    const announce = JSON.parse(str);
    if (new Date().valueOf() - announce.creationTime > 259200000 /* 3 days */) {
        clearAnnouncement();
        return undefined;
    }
    return announce;
}

function updateAnnouncement(announce) {
    extension.storageSet("announcement", JSON.stringify(announce));
}

function clearAnnouncement() {
    extension.storageSet("announcement", "");
}

function formatTime(date) {
    const year = date.getFullYear();
    const month = padTimeElement(date.getMonth() + 1);
    const day = padTimeElement(date.getDate());
    const hour = padTimeElement(date.getHours());
    const minute = padTimeElement(date.getMinutes());
    const seconds = padTimeElement(date.getSeconds());
    return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`;
}

function padTimeElement(num) {
    const str = num.toString();
    if (str.length > 1) {
        return str;
    }
    let s = str;
    while (s.length < 2) {
        s = "0" + s;
    }
    return s;
}
