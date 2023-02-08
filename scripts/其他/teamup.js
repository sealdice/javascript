// ==UserScript==
// @name         团队管理
// @author       檀轶步棋、NAO
// @version      1.0.1
// @timestamp    1675839686
// @license      MIT
// ==/UserScript==
/** 骰子自己的QQ号，team make时会被排除 */
let excQQ = [];
// 注：如果你将骰子绑定到了多个账号，或者想要排除特定账号，请逐一添加，格式如["QQ:1", "QQ:2", ...]
let ext = seal.ext.find("teamup");
if (!ext) {
    ext = seal.ext.new("teamup", "檀轶步棋", "1.0.1");
    seal.ext.register(ext);
}
class InfoManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.teamInfos = JSON.parse(ext.storageGet(`team_info_${this.ctx.group.groupId}`) || `{}`);
    }
    getTeam(name) {
        if (this.teamInfos[name] !== undefined && this.teamInfos[name].length > 0) {
            return this.teamInfos[name];
        }
        else
            return false;
    }
    getAllTeams() {
        if (JSON.stringify(this.teamInfos) !== "{}") {
            let lst = [];
            for (const [teamName, v] of Object.entries(this.teamInfos)) {
                lst.push(teamName);
            }
            return lst;
        }
        else
            return false;
    }
    makeTeam(name, members) {
        if (members !== undefined && members.length > 0) {
            this.teamInfos[name] = members;
        }
        else
            return new Error("格式错误");
        ext.storageSet(`team_info_${this.ctx.group.groupId}`, JSON.stringify(this.teamInfos));
    }
    destroyTeam(name) {
        if (this.teamInfos[name] !== undefined) {
            this.teamInfos[name] = undefined;
        }
        ext.storageSet(`team_info_${this.ctx.group.groupId}`, JSON.stringify(this.teamInfos));
    }
    deleteMembers(team, members) {
        if (this.getTeam(team) !== false || members.length <= 0) {
            members.forEach((member) => {
                try {
                    let index = this.teamInfos[team].indexOf(member);
                    this.teamInfos[team].splice(index, 1);
                    ext.storageSet(`team_info_${this.ctx.group.groupId}`, JSON.stringify(this.teamInfos));
                }
                catch (e) {
                    throw e;
                }
            });
        }
        else
            throw new Error("团队不存在或团队成员无效。");
    }
    addMembers(team, members) {
        if (this.getTeam(team) !== false || members.length <= 0) {
            members.forEach((member) => {
                try {
                    this.teamInfos[team].push(member);
                    ext.storageSet(`team_info_${this.ctx.group.groupId}`, JSON.stringify(this.teamInfos));
                }
                catch (e) {
                    throw e;
                }
            });
        }
        else
            throw new Error("团队不存在或团队成员无效。");
    }
}
let cmd = seal.ext.newCmdItemInfo();
cmd.name = "team";
cmd.help = ".team make @xxx @yyy (团队名) //创建团队，团队名可选\n" +
    ".team del 团队名 //删除团队\n" +
    ".team call 团队名 //呼叫团队\n" +
    ".team add @xxx @yyy 团队名 //向团队中添加成员\n" +
    ".team rm @xxx @yyy 团队名 //从团队中删除成员\n" +
    ".team show 团队名 //展示该团队所有成员\n" +
    ".team showAll //展示本群所有团队及其成员\n" +
    ".team delAll //删除本群所有团队";
cmd.allowDelegate = true;
cmd.solve = (ctx, msg, args) => {
    ctx.delegateText = "";
    // if (msg.platform != "QQ") {
    //     seal.replyToSender(ctx, msg, "非常抱歉，该指令暂不支持QQ以外的平台，包括QQ频道。");
    //     return seal.ext.newCmdExecuteResult(false);
    // }
    let manager = new InfoManager(ctx);
    switch (args.getArgN(1)) {
        case "help": {
            const ret = seal.ext.newCmdExecuteResult(true);
            ret.showHelp = true;
            return ret;
        }
        case "make": {
            switch (ctx.privilegeLevel) {
                case 100:
                case 60:
                case 50: {
                    try {
                        if (args.at.length > 20) {
                            seal.replyToSender(ctx, msg, "错误：团队数量不得超过20人。");
                            return seal.ext.newCmdExecuteResult(false);
                        }
                        else if (args.at.length <= 0) {
                            seal.replyToSender(ctx, msg, "错误：请指定团队成员。");
                            return seal.ext.newCmdExecuteResult(false);
                        }
                        let atInfos = [];
                        let readName = args.getArgN(2);
                        let teamName = undefined;
                        if (readName === "" || readName === undefined) {
                            for (let n = 1; true; n++) {
                                if (manager.getTeam(`team${n}`) === false) {
                                    teamName = `team${n}`;
                                    break;
                                }
                            }
                        }
                        else {
                            if (manager.getTeam(readName) !== false) {
                                seal.replyToSender(ctx, msg, `错误：团队${readName}已经存在，请删除现存团队后重新创建。`);
                                return seal.ext.newCmdExecuteResult(false);
                            }
                            else
                                teamName = readName;
                        }
                        args.at.forEach((v) => {
                            if (excQQ.length > 0) {
                                excQQ.forEach((x) => {
                                    if (x !== v.userId) {
                                        atInfos.push(v.userId);
                                    }
                                });
                            }
                            else {
                                atInfos.push(v.userId);
                            }
                        });
                        manager.makeTeam(teamName, atInfos);
                        seal.replyToSender(ctx, msg, `成功：团队\n${teamName}已经创建。`);
                        console.log(JSON.stringify(manager.getAllTeams()));
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    catch (e) {
                        seal.replyToSender(ctx, msg, `错误：发生系统内部错误，错误信息\n${e}`);
                        return seal.ext.newCmdExecuteResult(false);
                    }
                }
                default: {
                    seal.replyToSender(ctx, msg, "错误：只有骰主、群主或管理员能创建团队。");
                    return seal.ext.newCmdExecuteResult(false);
                }
            }
        }
        case "call": {
            try {
                let readName = args.getArgN(2);
                if (readName === "" || readName === undefined) {
                    seal.replyToSender(ctx, msg, `错误：请指定要呼叫的团队。`);
                    return seal.ext.newCmdExecuteResult(false);
                }
                let allMembers = manager.getTeam(readName);
                if (allMembers !== false) {
                    let memberList = [];
                    for (const [k, v] of Object.entries(allMembers)) {
                        let member = v.match("^[a-zA-Z]+:([0-9]+)$");
                        if (member[1] !== "" && member[1] != null) {
                            memberList.push(member[1]);
                        }
                    }
                    let reply = `正在呼叫${readName}：\n`;
                    memberList.forEach((v) => {
                        reply += seal.format(ctx, `[CQ:at,qq=${v}]`);
                    });
                    seal.replyToSender(ctx, msg, reply);
                    return seal.ext.newCmdExecuteResult(true);
                }
                else {
                    seal.replyToSender(ctx, msg, `错误：找不到团队${readName}。`);
                    return seal.ext.newCmdExecuteResult(false);
                }
            }
            catch (e) {
                seal.replyToSender(ctx, msg, `错误：发生系统内部错误，错误信息\n${e}`);
                return seal.ext.newCmdExecuteResult(false);
            }
        }
        case "del": {
            switch (ctx.privilegeLevel) {
                case 100:
                case 60:
                case 50: {
                    try {
                        let readName = args.getArgN(2);
                        if (readName === "" || readName === undefined) {
                            seal.replyToSender(ctx, msg, `错误：请指定要删除的团队。`);
                            return seal.ext.newCmdExecuteResult(false);
                        }
                        if (manager.getTeam(readName) !== false) {
                            manager.destroyTeam(readName);
                            seal.replyToSender(ctx, msg, `成功删除了\n${readName}。`);
                            return seal.ext.newCmdExecuteResult(true);
                        }
                    }
                    catch (e) {
                        seal.replyToSender(ctx, msg, `错误：发生系统内部错误，错误信息\n${e}`);
                        return seal.ext.newCmdExecuteResult(false);
                    }
                    break;
                }
                default: {
                    seal.replyToSender(ctx, msg, "错误：只有骰主、群主或管理员能创建团队。");
                    return seal.ext.newCmdExecuteResult(false);
                }
            }
            break;
        }
        case "delAll": {
            switch (ctx.privilegeLevel) {
                case 100:
                case 60:
                case 50: {
                    ext.storageSet(`team_info_${ctx.group.groupId}`, "{}");
                    seal.replyToSender(ctx, msg, "成功：已经删除所有团队。");
                    return seal.ext.newCmdExecuteResult(true);
                }
                default: {
                    seal.replyToSender(ctx, msg, "错误：只有骰主、群主或管理员能删除团队。");
                    return seal.ext.newCmdExecuteResult(false);
                }
            }
        }
        case "rm": {
            switch (ctx.privilegeLevel) {
                case 100:
                case 60:
                case 50: {
                    try {
                        if (args.at.length > 20) {
                            seal.replyToSender(ctx, msg, "错误：团队数量不得超过20人。");
                            return seal.ext.newCmdExecuteResult(false);
                        }
                        else if (args.at.length <= 0) {
                            seal.replyToSender(ctx, msg, "错误：请指定要删除的成员。");
                            return seal.ext.newCmdExecuteResult(false);
                        }
                        let readName = args.getArgN(2);
                        if (readName !== "" && readName !== undefined) {
                            let allMembers = manager.getTeam(readName);
                            if (allMembers !== false) {
                                let atInfos = [];
                                args.at.forEach((v) => {
                                    // typeof是为了消除ts编译器报错，实际上没有必要
                                    if (typeof allMembers == "object" && allMembers.indexOf(v.userId) > -1) {
                                        atInfos.push(v.userId);
                                    }
                                });
                                manager.deleteMembers(readName, atInfos);
                                seal.replyToSender(ctx, msg, `成功：从${readName}中删除了${atInfos.length}位成员，不在团队中的成员已经忽略。`);
                                return seal.ext.newCmdExecuteResult(true);
                            }
                            else {
                                seal.replyToSender(ctx, msg, `错误：找不到团队${readName}。`);
                                return seal.ext.newCmdExecuteResult(false);
                            }
                        }
                        else {
                            seal.replyToSender(ctx, msg, "错误：请指定要目标团队。");
                            return seal.ext.newCmdExecuteResult(false);
                        }
                    }
                    catch (e) {
                        seal.replyToSender(ctx, msg, `错误：发生系统内部错误，错误信息\n${e}`);
                        return seal.ext.newCmdExecuteResult(false);
                    }
                }
                default: {
                    seal.replyToSender(ctx, msg, "错误：只有骰主、群主或管理员能删除团队成员。");
                    return seal.ext.newCmdExecuteResult(false);
                }
            }
        }
        case "add": {
            switch (ctx.privilegeLevel) {
                case 100:
                case 60:
                case 50: {
                    try {
                        if (args.at.length <= 0) {
                            seal.replyToSender(ctx, msg, "错误：请指定要添加的成员。");
                            return seal.ext.newCmdExecuteResult(false);
                        }
                        let readName = args.getArgN(2);
                        if (readName !== "" && readName !== undefined) {
                            let allMembers = manager.getTeam(readName);
                            if (allMembers !== false) {
                                let atInfos = [];
                                args.at.forEach((v) => {
                                    // typeof是为了消除ts编译器报错，实际上没有必要
                                    if (typeof allMembers == "object" && allMembers.indexOf(v.userId) <= -1) {
                                        atInfos.push(v.userId);
                                    }
                                });
                                if ((args.at.length + atInfos.length) > 20) {
                                    seal.replyToSender(ctx, msg, "错误：团队数量不得超过20人。");
                                    return seal.ext.newCmdExecuteResult(false);
                                }
                                manager.addMembers(readName, atInfos);
                                seal.replyToSender(ctx, msg, `成功：向${readName}中添加了${atInfos.length}位成员，已经在团队中的成员被忽略。`);
                                return seal.ext.newCmdExecuteResult(true);
                            }
                            else {
                                seal.replyToSender(ctx, msg, `错误：找不到团队${readName}。`);
                                return seal.ext.newCmdExecuteResult(false);
                            }
                        }
                        else {
                            seal.replyToSender(ctx, msg, "错误：请指定要目标团队。");
                            return seal.ext.newCmdExecuteResult(false);
                        }
                    }
                    catch (e) {
                        seal.replyToSender(ctx, msg, `错误：发生系统内部错误，错误信息\n${e}`);
                        return seal.ext.newCmdExecuteResult(false);
                    }
                }
                default: {
                    seal.replyToSender(ctx, msg, "错误：只有骰主、群主或管理员能删除团队成员。");
                    return seal.ext.newCmdExecuteResult(false);
                }
            }
        }
        case "show": {
            try {
                let readName = args.getArgN(2);
                if (readName === "" || readName === undefined) {
                    seal.replyToSender(ctx, msg, `错误：请指定要显示的团队。`);
                    return seal.ext.newCmdExecuteResult(false);
                }
                let allMembers = manager.getTeam(readName);
                let memberList = [];
                if (allMembers !== false) {
                    for (const [k, v] of Object.entries(allMembers)) {
                        memberList.push(`- ${v}`);
                    }
                    seal.replyToSender(ctx, msg, `团队${readName}：\n${memberList.join("\n")}`);
                    return seal.ext.newCmdExecuteResult(true);
                }
                else {
                    seal.replyToSender(ctx, msg, `错误：团队${readName}不存在。`);
                    return seal.ext.newCmdExecuteResult(false);
                }
            }
            catch (e) {
                seal.replyToSender(ctx, msg, `错误：发生系统内部错误，错误信息\n${e}`);
                return seal.ext.newCmdExecuteResult(false);
            }
        }
        case "showAll": {
            let allTeamNames = manager.getAllTeams();
            let reply = `群组${ctx.group.groupName}（${ctx.group.groupId}）的全部团队：\n`;
            if (allTeamNames !== false) {
                for (const [i, name] of Object.entries(allTeamNames)) {
                    reply += `\n${name}\n`;
                    let allMembers = manager.getTeam(name);
                    console.log(name + "??" + JSON.stringify(allMembers));
                    let memberList = [];
                    if (allMembers !== false) {
                        for (const [k, v] of Object.entries(allMembers)) {
                            memberList.push(`- ${v}`);
                        }
                    }
                    reply += memberList.join("\n");
                }
                seal.replyToSender(ctx, msg, reply);
                return seal.ext.newCmdExecuteResult(true);
            }
            else {
                seal.replyToSender(ctx, msg, "错误：该群组还没有创建过团队。");
                return seal.ext.newCmdExecuteResult(false);
            }
        }
    }
    return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap["team"] = cmd;
