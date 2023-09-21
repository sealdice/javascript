// ==UserScript==
// @name         timeline
// @author       JohNSoN
// @version      1.0.1
// @description  故事时间线跟踪插件
// @timestamp    1678144385
// @license      The Unlicense
// @homepageURL  https://github.com/Xiangze-Li/sealdice-addon
// ==/UserScript==

// 首先检查是否已经存在
let ext = seal.ext.find('timeline');
if (!ext) {
    ext = seal.ext.new('timeline', 'JohNSoN', '1.0.0');
    seal.ext.register(ext);
}

const unitValue = {
    "s": 1000,
    "m": 60 * 1000,
    "h": 60 * 60 * 1000,
    "d": 24 * 60 * 60 * 1000,
};

// 解析时间字符串
//
// 支持格式 `2006-01-02 15:04:05`，时间部分可从后向前省略。将被认为是UTC的
function parseDatetimeString(dateString) {
    let d = new Date(0);

    let sp1 = dateString.split(" ");
    if (sp1.length < 1 || sp1.length > 2) return null;

    let dateSp = sp1[0].split("-");
    if (dateSp.length != 3) return null;
    d.setUTCFullYear(dateSp[0], dateSp[1] - 1, dateSp[2]);

    if (sp1.length == 2) {
        let timeSp = sp1[1].split(":");
        d.setUTCHours(...timeSp)
    } else {
        d.setUTCHours(0, 0, 0, 0);
    }

    return d;
}

// 解析时间间隔字符串
//
// 支持格式 `3D4h5m6s`，任意部分可省略、顺序无关、大小写无关
//
// 返回毫秒数
function parseDurationString(durationString) {
    const regex = /(\d+)([dhms])/g;

    let dur = 0;

    durationString = durationString.toLowerCase();
    let resArr = [...durationString.matchAll(regex)];

    for (let res of resArr) {
        let num = parseInt(res[1]);
        let unit = res[2];
        dur += num * (unitValue[unit] || 0);
    }

    return dur;
}

function durationToString(durationMs) {
    let day = Math.floor(durationMs / unitValue.d);
    durationMs %= unitValue.d;
    let hour = Math.floor(durationMs / unitValue.h);
    durationMs %= unitValue.h;
    let min = Math.floor(durationMs / unitValue.m);
    durationMs %= unitValue.m;
    let sec = Math.floor(durationMs / unitValue.s);

    let reply = "";
    if (day != 0) reply += day + "天";
    if (hour != 0) reply += hour + "时";
    if (min != 0) reply += min + "分";
    if (sec != 0) reply += sec + "秒";

    return (reply !== "" ? reply : "0");
}

function toReplyString(storage) {
    if (storage.baseSet) {
        return "当前时间为 " + formatDate(new Date(storage.base + storage.delta));
    }
    return "当前经过时间为 " + durationToString(storage.delta) + "(未设置基准时间)";
}

function formatDate(dateObj) {
    let year = dateObj.getUTCFullYear();
    let month = dateObj.getUTCMonth() + 1;
    let date = dateObj.getUTCDate();

    let day = dateObj.getUTCDay();
    const dayMap = ["日", "一", "二", "三", "四", "五", "六"];
    day = "星期" + dayMap[day];

    let hour = dateObj.getUTCHours();
    if (hour < 10) hour = "0" + hour;
    let min = dateObj.getUTCMinutes();
    if (min < 10) min = "0" + min;
    let sec = dateObj.getUTCSeconds();
    if (sec < 10) sec = "0" + sec;

    return `${year}年${month}月${date}日(${day}) ${hour}:${min}:${sec}`;
}

const cmd = seal.ext.newCmdItemInfo();
cmd.name = 'timeline'; // 指令名字，可用中文
cmd.help =
`timeline 故事时间线跟踪工具
==========================
.timeline setbase <now|基准时间>
    设置基准时间，时间格式为 2006-01-02 15:04:05，时间部分可从后向前省略
.timeline <add|sub> <时间间隔>
    增加或减少经过时间，时间间隔格式为 2D3h4m5s，任意部分可省略
.timeline forward <时间点>
    将当前时间向前推进到指定时间点，需先设置基准时间，不能回溯
.timeline reset
    重置经过时间为0
.timeline <rm|del|clr>
    清除基准时间和经过时间
.timeline show
    显示当前时间线
.timeline help
    显示帮助信息`;

cmd.solve = (ctx, msg, cmdArgs) => {
    const key = "timeline:" + ctx.group.groupId;
    let op = cmdArgs.getArgN(1);

    let st = JSON.parse(ext.storageGet(key) || "{}");
    if (st.base === undefined) st.base = 0;
    if (st.baseSet === undefined) st.baseSet = false;
    if (st.delta === undefined) st.delta = 0;

    let reply = "<" + ctx.player.name + ">";

    switch (op) {
        case "setbase": {
            let date = cmdArgs.getRestArgsFrom(2);
            let dateObj = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60 * 1000);
            if (date != "now")            {
                dateObj = parseDatetimeString(date);
                if (dateObj === null) {
                    reply = "无法解析时间字符串 " + date + "\n";
                    break;
                }
            }
            st.base = dateObj.getTime();
            st.baseSet = true;
            reply += "设置基准时间为 " + formatDate(dateObj) + "\n";
            reply += toReplyString(st) + "\n";
            break;
        }
        case "add": case "sub": {
            let dur = cmdArgs.getRestArgsFrom(2);
            let durMs = parseDurationString(dur);
            if (op == 'sub' && durMs > st.delta) {
                reply += "尝试减少经过时间" + durationToString(durMs) + "失败\n";
                reply += "变化量超过了当前经过时间 (" + durationToString(st.delta) + ")\n";
                break;
            }
            st.delta += (op == "add" ? 1 : -1) * durMs;
            reply += (op == "add" ? "增加" : "减少") + "经过时间" + durationToString(durMs) + "\n";
            reply += toReplyString(st) + "\n";
            break;
        }
        case "forward": case "fwd": {
            let date = cmdArgs.getRestArgsFrom(2);
            let dateObj = parseDatetimeString(date);
            if (dateObj === null) {
                reply = "无法解析时间字符串 " + date + "\n";
                break;
            }
            if (!st.baseSet) {
                reply += "尝试将时间线前进到 " + formatDate(dateObj) + " 失败\n";
                reply += "未设置基准时间，无法进行时间线前进\n";
                break;
            }
            let dateTs = dateObj.getTime();
            if (dateTs <= st.base + st.delta) {
                reply += "尝试将时间线前进到 " + formatDate(dateObj) + " 失败\n";
                reply += "目标时间必须晚于当前时间 (" +  +")\n";
                break;
            }
            st.delta = dateTs - st.base;
            reply += "将时间线前进到 " + formatDate(dateObj) + "\n";
            break;
        }
        case "reset": {
            st.delta = 0;
            reply += "已重置经过时间\n" + toReplyString(st) + "\n";
            break;
        }
        case "rm": case "del": case "clr": {
            st.base = 0;
            st.baseSet = false;
            st.delta = 0;
            reply += "已清空时间线\n";
            break;
        }
        case "show": {
            reply = toReplyString(st) + "\n";
            break;
        }
        case 'help': default: {
            const ret = seal.ext.newCmdExecuteResult(true);
            ret.showHelp = true;
            return ret;
        }
    }

    ext.storageSet(key, JSON.stringify(st));
    seal.replyToSender(ctx, msg, reply);
    return seal.ext.newCmdExecuteResult(true);
};
// 将命令注册到扩展中
ext.cmdMap['timeline'] = cmd;


/**
 * CHANGELOG
 *
 * v1.0.1 2023-03-07
 * 添加了forward命令，用于将当前时间向前推进到指定时间点
 * 增加一个baseSet变量，用于记录是否设置了基准时间，代替base==0的判断。避免基准时间为1970-01-01 00:00:00时误认为未设置基准时间
 *
 * v1.0.0 2023-03-05
 * 初始版本
 * 实现了设置基准时间、增减经过时间、重置经过时间、清除时间线、显示时间线的功能
 */
