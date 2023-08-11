// ==UserScript==
// @name         Delta Green
// @author       浣熊旅記
// @version      1.0.0
// @description  DG规则插件，通过.dg <数量>作成DG属性卡
// @timestamp    1688728810
// 2023-07-07
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

let ext = seal.ext.find('DG');
if (!ext) {
  ext = seal.ext.new('DG', '浣熊旅記', '1.0.1');
  seal.ext.register(ext);
}

const cmdSeal = seal.ext.newCmdItemInfo();
cmdSeal.name = 'dg'; // 指令名字
cmdSeal.help = 'DG人物作成\n.dg <次数> // 随机生成对应次数DG属性';
cmdSeal.solve = (ctx, msg, cmdArgs) => {
  let val = cmdArgs.getArgN(1);
  switch (val) {
    case 'help': {
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }
    default: {
      if (!parseInt(val) || parseInt(val) == 0) {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
      } else {
        let times = parseInt(val), split = '', ret = '', res = '';
        if (times > 10) {
          ret = "拒绝执行：制卡次数过多。"
          seal.replyToSender(ctx, msg, ret);
        } else {
          for (i = 0; i < times; i++) {
            if (i < times - 1) {split = seal.formatTmpl(ctx, "COC:制卡_分隔符")} else {split = ''};
            let t1 = parseInt(seal.format(ctx,"{4d6k3}")), t2 = parseInt(seal.format(ctx,"{4d6k3}")), t3 = parseInt(seal.format(ctx,"{4d6k3}")),
                t4 = parseInt(seal.format(ctx,"{4d6k3}")), t5 = parseInt(seal.format(ctx,"{4d6k3}")), t6 = parseInt(seal.format(ctx,"{4d6k3}")),
                tSum = t1 + t2 +t3 + t4 + t5 +t6, 
            card = "力量:" + t1 + " 体质:" + t2 + " 敏捷:" + t3 + "\n" +
                   "智力:" + t4 + " 意志:" + t5 + " 魅力:" + t6 + "\n" +
                   "合计:" + tSum + " 理智:" + (t5*5) + " 体力:" + Math.ceil((t1 + t2) / 2);
            res = res + card + split
            ret = seal.format(ctx, "{$t玩家}的DG人物作成：\n") + res
          }
          seal.replyToSender(ctx, msg, ret);
        }
      };
    }
  }
};
// 将命令注册到扩展中
ext.cmdMap['dg'] = cmdSeal;