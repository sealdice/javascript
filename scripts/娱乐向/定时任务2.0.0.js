// ==UserScript==
// @name         定时任务
// @author       SzzRain
// @version      2.0.0
// @description  设置定时发送消息，支持设置每天准时发送或间隔一段时间发送（使用 .定时任务 help 查看详情）
// @timestamp    1699086084
// @license      MIT
// @homepageURL  https://github.com/Szzrain
// ==/UserScript==

class TaskTimer {
    static __instance = null;
    nextId = 0;
    taskqueue = new Map();
    isRunning = false;
    extension = null;
    getUUID() {
        let id = this.nextId;
        this.nextId = this.nextId + 1;
        return "T" + id;
    }
    constructor(ext, queue = null) {
        if (TaskTimer.__instance !== null) {
            throw new Error("TaskTimer为单例模式");
        }
        if (queue != null && queue instanceof Map) {
            this.taskqueue = queue;
        }
        this.extension = ext;
        TaskTimer.__instance = this;
    }
    save() {
        let tempMap = new Map();
        for (let task of this.taskqueue.values()) {
            if (task["fun"] === messageTask) {
                tempMap.set(task["id"], task);
            }
        }
        this.extension.storageSet("taskquene", JSON.stringify(Object.fromEntries(tempMap)));
    }
    work() {
        if (this.isRunning) {
            for (let task of this.taskqueue.values()) {
                if (task["interval"] != null) {
                    // console.log("cycT")
                    this.cycleTask(task);
                } else if (task["timing"] != null) {
                    // console.log("timT")
                    this.timingTask(task);
                }
            }
            this.save();
            setTimeout(() => { this.work() }, 5000);
            // console.log("taskNum:" + this.taskqueue.length)
        }
    }
    cycleTask(task) {
        if (task["next_sec"] <= new Date().getTime()) {
            try {
                task["fun"](...task['arg']);
            } catch (e) {
                console.log(e);
            } finally {
                task['next_sec'] = new Date().getTime() + task['interval'];
                this.checkTimesAndRemove(task);
            }
        }
    }
    timingTask(task) {
        if (task["frequency"] === "daily") {
            let todaySec = this.getTodayUntilNow()
            // console.log("tmcall");
            if (task['today'] !== this.getToday()) {
                // console.log("refresh date");
                task['today'] = this.getToday()
                task['today_done'] = false;
            }
            if (task["first_work"]) {
                // console.log("first work call")
                if (todaySec >= task["task_sec"]) {
                    task["today_done"] = true;
                    task["first_work"] = false;
                } else {
                    task["first_work"] = false;
                }
            }
            if (!(task["today_done"])) {
                // console.log("execute task")
                if (todaySec >= task["task_sec"]) {
                    try {
                        task['fun'](...task['arg']);
                    } catch (e) {
                        console.log(e);
                    } finally {
                        task["today_done"] = true;
                        if (task["first_work"]) {
                            task["first_work"] = false;
                        }
                        this.checkTimesAndRemove(task);
                    }
                }
            }
        } else if (task["frequency"] === "weekly") {
            const d = new Date();
            if (d.getDay() === task["work_day"]) {
                let todaySec = this.getTodayUntilNow();
                if (task["first_work"]) {
                    // console.log("first work call")
                    if (todaySec >= task["task_sec"]) {
                        task["this_week_done"] = true;
                        task["first_work"] = false;
                    } else {
                        task["first_work"] = false;
                    }
                }
                if (!(task["this_week_done"])) {
                    // console.log("execute task")
                    if (todaySec >= task["task_sec"]) {
                        try {
                            task['fun'](task['arg']);
                        } catch (e) {
                            console.log(e);
                        } finally {
                            task["this_week_done"] = true;
                            if (task["first_work"]) {
                                task["first_work"] = false;
                            }
                            this.checkTimesAndRemove(task);
                        }
                    }
                }
            } else {
                task["this_week_done"] = false;
            }
        }

    }
    checkTimesAndRemove(task) {
        if (task["times"] > 0) {
            task["times"]--;
        }
        if (task["times"] > -10) {
            this.taskqueue.delete(task["id"]);
        }
    }
    getTodayUntilNow() {
        let i = new Date();
        return i.getHours() * 3600 + i.getMinutes() * 60 + i.getSeconds();
    }
    getToday() {
        let i = new Date();
        return i.getDay();
    }
    joinTaskDaily(ctx, fun, interval = null, timing = null, exeTimes = -10, ...args) {
        if ((interval != null && timing != null) || (interval == null && timing == null)) {
            throw new Error("参数不正确，interval和timing同时出现或都为null");
        }
        if (timing != null && (!(0 <= timing && timing < 24))) {
            throw new Error("参数不正确，时间的取值范围为[0,24)");
        }
        if (interval != null && interval < 5000) {
            throw new Error("参数不正确，间隔时间最少为5");
        }
        // console.log("taskADD");
        let task = {
            "fun": fun,
            "id": this.getUUID(),
            "times": exeTimes,
            "arg": args,
            "interval": interval,
            "timing": timing,
            "creator": ctx.player.userId,
            "isGroup": false,
            "group": ctx.group.groupId
        }
        if (timing != null) {
            task["task_sec"] = timing * 3600;
            task["today_done"] = false;
            task["first_work"] = true;
            task["today"] = this.getToday();
            task["frequency"] = "daily";
        } else if (interval != null) {
            task["next_sec"] = new Date().getTime() + interval;
        }
        if (!ctx.group.isPrivate) {
            task["isGroup"] = true;
        }
        this.taskqueue.set(task["id"],task);
        this.save();
        return task
    }
    joinTaskWeekly(ctx, fun, workday, timing, exeTimes = -10, ...args) {
        if (workday === 7) {
            workday = 0;
        }
        if ( (workday == null || timing == null)) {
            throw new Error("参数不正确，workday或timing为null");
        }
        if ((!(0 <= timing && timing < 24))) {
            throw new Error("参数不正确，时间的取值范围为[0,24)");
        }
        if (workday > 6 || workday < 0) {
            throw new Error("参数不正确，星期天数应当在0-7之间，考虑到兼容性，0和7都算星期日");
        }
        // console.log("taskADD");
        let task = {
            "fun": fun,
            "id": this.getUUID(),
            "times": exeTimes,
            "arg": args,
            "timing": timing,
            "creator": ctx.player.userId,
            "isGroup": false,
            "group": ctx.group.groupId
        }
        task["task_sec"] = timing * 3600;
        task["this_week_done"] = false;
        task["work_day"] = workday;
        task["first_work"] = true;
        task["frequency"] = "weekly";
        if (!ctx.group.isPrivate) {
            task["isGroup"] = true;
        }
        this.taskqueue.set(task["id"],task);
        this.save();
        return task;
    }
    lookTaskWithCheck(ctx, id) {
        if (this.taskqueue.has(id)) {
            let task = this.taskqueue.get(id);
            if (ctx.privilegeLevel === 100) {
                return this.getTaskInfo(task);
            } else if (task["isGroup"] && ctx.group.groupId === task["group"] && ctx.privilegeLevel >= 40) {
                return this.getTaskInfo(task);
            } else if (task["creator"] === ctx.player.userId) {
                return this.getTaskInfo(task);
            } else {
                return "你不是任务创建者或master，或者你不是该任务所属的群管理员或邀请者";
            }
        }
        return "id对应的任务不存在或已经被删除";
    }
    getTaskInfo(task) {
        return "Id:" + task["id"] + " 位于:" + task["group"] + " 创建者:" + task["creator"] + "\n" + "frequency:" + task["frequency"] + "\ninterval: " + task["interval"] + "\ntiming: " + task["timing"] + "\ntimes: " + task["times"]+ "\nargs:" + task["arg"];
    }
    setTaskExecTimeWithCheck(ctx, id, times) {
        if (this.taskqueue.has(id)) {
            if ((!isNaN(Number(times, 10))) && times > 0) {
                let task = this.taskqueue.get(id);
                let text = "修改成功";
                if (ctx.privilegeLevel === 100) {
                    task["times"] = times;
                } else if (task["isGroup"] && ctx.group.groupId === task["group"] && ctx.privilegeLevel >= 40) {
                    task["times"] = times;
                } else if (task["creator"] === ctx.player.userId) {
                    task["times"] = times;
                } else {
                    text = "你不是任务创建者或master，或者你不是该任务所属的群管理员或邀请者";
                }
                return text;
            } else {
                return "参数错误，指令中次数必须是整数数字且必须大于0";
            }
        }
        return "id对应的任务不存在或已经被删除";
    }
    delTaskWithCheck(ctx, id) {
        if (this.taskqueue.has(id)) {
            let task = this.taskqueue.get(id);
            let text = "删除成功";
            if (ctx.privilegeLevel === 100) {
                this.taskqueue.delete(id);
            } else if (task["isGroup"] && ctx.group.groupId === task["group"] && ctx.privilegeLevel >= 40) {
                this.taskqueue.delete(id);
            } else if (task["creator"] === ctx.player.userId) {
                this.taskqueue.delete(id);
            } else {
                text = "你不是任务创建者或master，或者你不是该任务所属的群管理员或邀请者";
            }
            return text;
        }
        return "id对应的任务不存在或已经被删除";
    }
    run() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.work();
        }
    }
    reset() {
        this.isRunning = false;
        this.taskqueue = new Map();
        this.nextId = 0;
        this.save();
    }
    getTaskList(ctx) {
        let text = "任务队列\n";
        for (let task of this.taskqueue.values()) {
            if (ctx.privilegeLevel === 100) {
                text += this.getTaskInfoBase(task);
            } else if (task["isGroup"] && ctx.group.groupId === task["group"] && ctx.privilegeLevel >= 40) {
                text += this.getTaskInfoBase(task);
            } else if (task["creator"] === ctx.player.userId) {
                text += this.getTaskInfoBase(task);
            }
        }
        return text;
    }
    getTaskInfoBase(task) {
        return "Id:" + task["id"] + " 位于:" + task["group"] + " 创建者:" + task["creator"] +"\n";
    }
}
function getCtxAndMsgById(epId, guildId, groupId, senderId, isPrivate) {
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
            msg.sender.userId = senderId;
            return [seal.createTempCtx(eps[i], msg), msg];
        }
    }
    return undefined;
}
function messageTask(epId, guildId, groupId, userId, isPrivate, text) {
    // console.log("messageTask")
    let targetCtx = getCtxAndMsgById(epId, guildId, groupId, userId, isPrivate);

    // console.log("messagesend")
    seal.replyToSender(targetCtx[0], targetCtx[1], text);
}
if (!seal.ext.find('定时任务')) {
    const ext = seal.ext.new('定时任务', 'SzzRain', '2.0.0');
    // 创建一个命令
    const cmdTimedTask = seal.ext.newCmdItemInfo();
    cmdTimedTask.name = '定时任务';
    cmdTimedTask.help = 'TaskTimer javascript for SealDice by SzzRain (QQ:1970978827) ver 2.0.0\n' +
        '=========================\n' +
        '食用方法（注意都是24小时制）：\n' +
        'P.S：请把时间转换为小数，例如 6:30 转换为 6.5\n' +
        '\n' +
        '.定时任务 每天 6.1 定时提醒1  \n' +
        '# 每天 6:06 发送 定时提醒1\n' +
        '\n' +
        '.定时任务 每天 14 提醒写作业  \n' +
        '# 每天 14:00 发送 提醒写作业\n' +
        '\n' +
        '.定时任务 每周 1 9 海豹更新了吗  \n'+
        '# 每周一 9:00 发送 海豹更新了吗\n\n'+
        '\n' +
        '.定时任务 周期 10 周期任务1  \n' +
        '# 每 10 秒发送 1 次 周期任务1\n' +
        '\n' +
        '.定时任务 列表 \n' +
        '# 列出你有权限操作的所有任务\n' +
        '\n' +
        '.定时任务 查看 <Id>\n' +
        '# 给出指定Id的任务的详细信息\n' +
        '\n' +
        '.定时任务 设置执行次数 <Id> <次数>\n' +
        '# 设置某一项任务的执行次数，执行完毕之后会自动删除，如果不设置的话默认会一直执行下去\n' +
        '\n' +
        '.定时任务 删除 <Id>\n' +
        '# 删除一项任务\n' +
        '\n' +
        'Master指令：\n' +
        '.定时任务 重置 \n#重置并清空定时任务队列\n' +
        '=========================';
    //.定时任务 每日/周期 时间（间隔） 消息
    cmdTimedTask.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1);
        let msgTaskArgs = [ctx,msg,cmdArgs.getArgN(3)];
        switch (val) {
            case 'help': {
                const ret = seal.ext.newCmdExecuteResult(true);
                ret.showHelp = true;
                return ret;
            }
            case "每天":
                // console.log("dingshi")
                msgTaskArgs = [ctx,msg,cmdArgs.getArgN(3)];
                TaskTimer.__instance.joinTaskDaily(ctx, messageTask, null, parseFloat(cmdArgs.getArgN(2)), -10, ctx.endPoint.userId, msg.guildId, msg.groupId, msg.sender.userId, (msg.messageType === "private"), cmdArgs.getArgN(3));
                TaskTimer.__instance.run();
                seal.replyToSender(ctx, msg, "任务已加入队列");
                break;
            case "daily":
                // console.log("dingshi")
                msgTaskArgs = [ctx,msg,cmdArgs.getArgN(3)];
                TaskTimer.__instance.joinTaskDaily(ctx, messageTask, null, parseFloat(cmdArgs.getArgN(2)), -10, ctx.endPoint.userId, msg.guildId, msg.groupId, msg.sender.userId, (msg.messageType === "private"), cmdArgs.getArgN(3));
                TaskTimer.__instance.run();
                seal.replyToSender(ctx, msg, "任务已加入队列");
                break;
            case "周期":
                // console.log("zhouqi" + parseFloat(cmdArgs.getArgN(2))*1000)
                TaskTimer.__instance.joinTaskDaily(ctx, messageTask, parseFloat(cmdArgs.getArgN(2))*1000, null,-10, ctx.endPoint.userId, msg.guildId, msg.groupId, msg.sender.userId, (msg.messageType === "private"), cmdArgs.getArgN(3));
                TaskTimer.__instance.run();
                seal.replyToSender(ctx, msg, "任务已加入队列");
                break;
            case "每周":
                msgTaskArgs = [ctx,msg,cmdArgs.getArgN(4)];
                TaskTimer.__instance.joinTaskWeekly(ctx, messageTask, parseFloat(cmdArgs.getArgN(2)), parseFloat(cmdArgs.getArgN(3)),-10, ctx.endPoint.userId, msg.guildId, msg.groupId, msg.sender.userId, (msg.messageType === "private"), cmdArgs.getArgN(3));
                TaskTimer.__instance.run();
                seal.replyToSender(ctx, msg, "任务已加入队列");
                break;
            case "weekly":
                msgTaskArgs = [ctx,msg,cmdArgs.getArgN(4)];
                TaskTimer.__instance.joinTaskWeekly(ctx, messageTask, parseFloat(cmdArgs.getArgN(2)), parseFloat(cmdArgs.getArgN(3)),-10, ctx.endPoint.userId, msg.guildId, msg.groupId, msg.sender.userId, (msg.messageType === "private"), cmdArgs.getArgN(3));
                TaskTimer.__instance.run();
                seal.replyToSender(ctx, msg, "任务已加入队列");
                break;
            case "cycle":
                // console.log("zhouqi" + parseFloat(cmdArgs.getArgN(2))*1000)
                TaskTimer.__instance.joinTaskDaily(ctx, messageTask, parseFloat(cmdArgs.getArgN(2))*1000, null,-10, ctx.endPoint.userId, msg.guildId, msg.groupId, msg.sender.userId, (msg.messageType === "private"), cmdArgs.getArgN(3));
                TaskTimer.__instance.run();
                seal.replyToSender(ctx, msg, "任务已加入队列");
                break;
            case "重置":
                if (ctx.privilegeLevel === 100) {
                    TaskTimer.__instance.reset();
                    seal.replyToSender(ctx, msg, "已重置定时任务并清空任务队列");
                } else {
                    seal.replyToSender(ctx, msg, "权限不足，仅master可用");
                }
                break;
            case "reset":
                if (ctx.privilegeLevel === 100) {
                    TaskTimer.__instance.reset();
                    seal.replyToSender(ctx, msg, "已重置定时任务并清空任务队列");
                } else {
                    seal.replyToSender(ctx, msg, "权限不足，仅master可用");
                }
                break;
            case "列表":
                seal.replyToSender(ctx, msg, TaskTimer.__instance.getTaskList(ctx));
                break;
            case "list":
                seal.replyToSender(ctx, msg, TaskTimer.__instance.getTaskList(ctx));
                break;
            case "删除":
                seal.replyToSender(ctx, msg, TaskTimer.__instance.delTaskWithCheck(ctx, cmdArgs.getArgN(2)));
                break;
            case "del":
                seal.replyToSender(ctx, msg, TaskTimer.__instance.delTaskWithCheck(ctx, cmdArgs.getArgN(2)));
                break;
            case "查看":
                seal.replyToSender(ctx, msg, TaskTimer.__instance.lookTaskWithCheck(ctx, cmdArgs.getArgN(2)));
                break;
            case "look":
                seal.replyToSender(ctx, msg, TaskTimer.__instance.lookTaskWithCheck(ctx, cmdArgs.getArgN(2)));
                break;
            case "设置执行次数":
                seal.replyToSender(ctx, msg, TaskTimer.__instance.setTaskExecTimeWithCheck(ctx, cmdArgs.getArgN(2), cmdArgs.getArgN(3)));
                break;
            case "setexecutetime":
                seal.replyToSender(ctx, msg, TaskTimer.__instance.setTaskExecTimeWithCheck(ctx, cmdArgs.getArgN(2), cmdArgs.getArgN(3)));
                break;
            default:
                seal.replyToSender(ctx, msg, "未知的参数，使用 .定时任务 help 查看使用说明");
        }
        return seal.ext.newCmdExecuteResult(true);
    }
    // 注册命令
    ext.cmdMap['定时任务'] = cmdTimedTask;
    ext.cmdMap['tt'] = cmdTimedTask;
    ext.cmdMap['tasktimer'] = cmdTimedTask;

    // 注册扩展
    seal.ext.register(ext);
    let taskqueue = new Map(Object.entries(JSON.parse(ext.storageGet("taskquene") || '{}')));
    for (let task of taskqueue.values()) {
        task["fun"] = messageTask;
    }
    globalThis.timer = new TaskTimer(ext, taskqueue);
    TaskTimer.__instance.run();
}
