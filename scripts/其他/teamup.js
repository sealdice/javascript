// ==UserScript==
// @name         团队插件
// @author       檀轶步棋
// @version      2.0.0
// @description  基本的 team 实现，进阶功能等官方
// @timestamp    2024-07-16 21:15:00
// @license      MIT
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

let extension = seal.ext.find("team");
if (!extension) {
  extension = seal.ext.new("team", "檀轶步棋", "2.0.0");
  seal.ext.register(extension);
}
class GroupTeamManager {
  ctx;
  teams;
  get groupId() {
    return this.ctx.group.groupId;
  }
  constructor(ctx) {
    this.ctx = ctx;
    this.fetch();
  }
  /* Creates a new team with the given name and members. */
  create(name, members) {
    if (this.teams[name]) {
      throw new Error(`A team with the name ${name} already exists.`);
    }
    this.teams[name] = members;
    this.save();
  }
  /* Inserts members into the team. Team must exist beforehand. */
  insert(team, members) {
    if (!this.teams[team]) {
      throw new Error(`The team with the name ${team} does not exist.`);
    }
    members.forEach(m => {
      if (!this.teams[team].includes(m)) {
        this.teams[team].push(m);
      }
    });
    this.save();
  }
  /* Remove members from the team. Team must exist beforehand. */
  remove(team, members) {
    if (!this.teams[team]) {
      throw new Error(`The team with the name ${team} does not exist.`);
    }
    this.teams[team] = this.teams[team].filter(m => !members.includes(m));
    if (this.teams[team].length == 0) {
      this.teams[team] = undefined;
    }
    this.save();
  }
  /* Deletes the whole team, returning the count of members it used to contains.
   * Team must exist beforehand.
   */
  delete(team) {
    if (!this.teams[team]) {
      throw new Error(`The team with the name ${team} does not exist.`);
    }
    const len = this.teams[team].length;
    this.teams[team] = undefined;
    this.save();
    return len;
  }
  save() {
    if (this.teams && Object.keys(this.teams).length != 0) {
      extension.storageSet(`teams_${this.groupId}`, JSON.stringify(this.teams));
    }
  }
  fetch() {
    this.teams = JSON.parse(extension.storageGet(`teams_${this.groupId}`) || "{}");
  }
}
const cmdTeam = seal.ext.newCmdItemInfo();
cmdTeam.name = "team";
cmdTeam.help =
  "team list // 展示当前群组的所有队伍\n" +
  "team add <队名> @成员1 @成员2 ... // 向队伍中加入相关成员\n" +
  "team new <队名?> @成员1 @成员2 ... // 新建队伍，队名可选\n" +
  "team rm <队名> @成员1 @成员2 ... // 从队伍中删除成员\n" +
  "team del <队名> // 删除整个队伍\n" +
  "team call <队名> // 呼叫队伍";
cmdTeam.disabledInPrivate = true;
cmdTeam.allowDelegate = true;
cmdTeam.solve = (ctx, msg, args) => {
  ctx.delegateText = "";
  args.chopPrefixToArgsWith("help", "list", "add", "new", "rm", "del", "call");
  const exeResult = seal.ext.newCmdExecuteResult(true);
  const subcommand = args.getArgN(1);
  if (!subcommand || subcommand == "help") {
    exeResult.showHelp = true;
    return exeResult;
  }
  const manager = new GroupTeamManager(ctx);
  switch (subcommand) {
    case "list": {
      if (Object.keys(manager.teams).length == 0) {
        seal.replyToSender(ctx, msg, "本群尚未建立队伍");
        break;
      }
      const teams = [];
      Object.entries(manager.teams).forEach(([n, mem]) => {
        const members = [];
        mem.forEach(m => members.push(`- ${m}`));
        teams.push(`${n}:\n${members.join('\n')}`);
      });
      seal.replyToSender(ctx, msg, `本群的所有队伍:\n\n${teams.join("\n\n")}`);
      break;
    }
    case "add": {
      const name = args.getArgN(2) || `team${Object.keys(manager.teams).length + 1}`;
      if (!manager.teams[name]) {
        seal.replyToSender(ctx, msg, `没有名为${name}的队伍，先创建一个吧`);
        break;
      }
      const mentions = args.at;
      if (mentions.length == 0) {
        seal.replyToSender(ctx, msg, "请@要添加的成员");
        break;
      }
      const members = mentions
        .map(m => m.userId)
        .filter(m => m != ctx.endPoint.userId);
      manager.insert(name, members);
      seal.replyToSender(ctx, msg, `已向 ${name} 添加了 ${members.length} 名成员`);
      break;
    }
    case "new": {
      const name = args.getArgN(2) || `team${Object.keys(manager.teams).length + 1}`;
      const mentions = args.at;
      if (mentions.length == 0) {
        seal.replyToSender(ctx, msg, "请@要添加的成员");
        break;
      }
      const members = mentions.map(m => m.userId);
      manager.create(name, members);
      seal.replyToSender(ctx, msg, `已创建 ${name} 并添加了 ${members.length} 名成员`);
      break;
    }
    case "rm": {
      const name = args.getArgN(2) || `team${Object.keys(manager.teams).length + 1}`;
      if (!manager.teams[name]) {
        seal.replyToSender(ctx, msg, `没有名为${name}的队伍，先创建一个吧`);
        break;
      }
      const mentions = args.at;
      if (mentions.length == 0) {
        seal.replyToSender(ctx, msg, "请@要删除的成员");
        break;
      }
      const members = mentions.map(m => m.userId);
      manager.remove(name, members);
      seal.replyToSender(ctx, msg, `已从 ${name} 删除了 ${members.length} 名成员`);
      break;
    }
    case "del": {
      const name = args.getArgN(2) || `team${Object.keys(manager.teams).length + 1}`;
      if (!manager.teams[name]) {
        seal.replyToSender(ctx, msg, `没有名为${name}的队伍`);
        break;
      }
      manager.delete(name);
      seal.replyToSender(ctx, msg, `已删除了队伍 ${name}`);
      break;
    }
    case "call": {
      const name = args.getArgN(2) || `team${Object.keys(manager.teams).length + 1}`;
      if (!manager.teams[name]) {
        seal.replyToSender(ctx, msg, `没有名为${name}的队伍`);
        break;
      }
      const calls = [];
      manager.teams[name].forEach(m => {
        const id = m.split(":")[1];
        calls.push(`[CQ:at,qq=${id}]`);
      });
      seal.replyToSender(ctx, msg, `呼叫 ${name}: ${calls.join(" ")}`);
      break;
    }
    case "help":
    default: {
      exeResult.showHelp = true;
      break;
    }
  }
  return exeResult;
};
extension.cmdMap["team"] = cmdTeam;
