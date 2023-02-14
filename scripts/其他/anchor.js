// ==UserScript==
// @name         群内安价收集
// @author       憧憬少
// @version      1.0.0
// @description  在群内收集群友给出的安价选项，并掷骰得出结果
// @timestamp    1676386517
// 2023-02-14 22:55:17
// @license      MIT
// @homepageURL  https://github.com/ChangingSelf/sealdice-js-ext-anchor
// ==/UserScript==

(() => {
  // src/index.ts
  const HELP = `群内安价收集(ak是アンカー罗马字缩写)
注意ak后面有空格，“.ak”也可以换成“.安价”

.ak help //查看帮助
.ak # 标题 //新建一轮分歧并设标题
.ak + 选项 //需要添加的选项的内容
.ak - 序号 //需要移除的选项的序号
.ak ? //列出目前所有选项
.ak = //随机抽取1个选项并继续
.ak = n //随机抽取n个选项并继续
`;
  const STORAGE_KEY = "anchor";
  const OPTION_NUM_PER_PAGE = 15;//列出所有选项时，每页放多少个选项
  function akNew(ctx, msg, ext, title) {
    const data = {
      "title": title,
      "options": []
    };
    ext.storageSet(STORAGE_KEY, JSON.stringify(data));
    seal.replyToSender(ctx, msg, `已新建分歧:${title}`);
  }
  function akAdd(ctx, msg, ext, option) {
    const data = JSON.parse(ext.storageGet(STORAGE_KEY) || '{"title":"","options":[]}');
    data.options.push(option);
    seal.replyToSender(ctx, msg, `当前分歧:${data.title}
已添加第${data.options.length}个选项:${option}`);
    ext.storageSet(STORAGE_KEY, JSON.stringify(data));
  }
  function akDel(ctx, msg, ext, index) {
    const data = JSON.parse(ext.storageGet(STORAGE_KEY) || '{"title":"","options":[]}');
    const removed = data.options.splice(index - 1, 1)[0];
    seal.replyToSender(ctx, msg, `当前分歧:${data.title}
已移除第${index}个选项:${removed}`);
    ext.storageSet(STORAGE_KEY, JSON.stringify(data));
  }
  function akList(ctx, msg, ext) {
    const data = JSON.parse(ext.storageGet(STORAGE_KEY) || '{"title":"","options":[]}');
    if (data.options.length === 0) {
      seal.replyToSender(ctx, msg, `当前分歧:${data.title}
还没有任何选项呢`);
      return;
    }
    let optStr = "";
    let curPageRows = 0;
    data.options.forEach((value, index) => {
      optStr += `${index + 1}.${value}
`;
      ++curPageRows;
      if (curPageRows >= OPTION_NUM_PER_PAGE) {
        seal.replyToSender(ctx, msg, `当前分歧:${data.title}
${optStr}`);
        optStr = "";
        curPageRows = 0;
      }
    });
    if (curPageRows > 0) {
      seal.replyToSender(ctx, msg, `当前分歧:${data.title}
${optStr}`);
    }
  }
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function akGet(ctx, msg, ext, num = 1) {
    const data = JSON.parse(ext.storageGet(STORAGE_KEY) || '{"title":"","options":[]}');
    if (data.options.length === 0) {
      seal.replyToSender(ctx, msg, `当前分歧:${data.title}
还没有任何选项呢`);
      return;
    }
    akList(ctx, msg, ext);
    let optStr = "";
    for (let i = 0; i < num; ++i) {
      const r = randomInt(1, data.options.length);
      const result = data.options.splice(r - 1, 1);
      optStr += `${i + 1}.${result}
`;
    }
    seal.replyToSender(ctx, msg, `结果是:
${optStr}`);
    ext.storageSet(STORAGE_KEY, JSON.stringify(data));
  }
  function main() {
    let ext = seal.ext.find("anchor");
    if (!ext) {
      ext = seal.ext.new("anchor", "憧憬少", "1.0.0");
      seal.ext.register(ext);
    }
    const cmdSeal = seal.ext.newCmdItemInfo();
    cmdSeal.name = "安价";
    cmdSeal.help = HELP;
    cmdSeal.solve = (ctx, msg, cmdArgs) => {
      try {
        let val = cmdArgs.getArgN(1);
        switch (val) {
          case "#": {
            const title = cmdArgs.getArgN(2);
            akNew(ctx, msg, ext, title);
            return seal.ext.newCmdExecuteResult(true);
          }
          case "+": {
            const option = cmdArgs.getArgN(2);
            akAdd(ctx, msg, ext, option);
            return seal.ext.newCmdExecuteResult(true);
          }
          case "-": {
            const index = Number(cmdArgs.getArgN(2));
            akDel(ctx, msg, ext, index);
            return seal.ext.newCmdExecuteResult(true);
          }
          case "?":
          case "？": {
            akList(ctx, msg, ext);
            return seal.ext.newCmdExecuteResult(true);
          }
          case "=": {
            let num = 1;
            if (cmdArgs.args.length >= 2) {
              num = Number(cmdArgs.getArgN(2));
            }
            akGet(ctx, msg, ext, num);
            return seal.ext.newCmdExecuteResult(true);
          }
          case "help":
          default: {
            const ret = seal.ext.newCmdExecuteResult(true);
            ret.showHelp = true;
            return ret;
          }
        }
      } catch (error) {
        seal.replyToSender(ctx, msg, error.Message);
        return seal.ext.newCmdExecuteResult(true);
      }
    };
    ext.cmdMap["安价"] = cmdSeal;
    ext.cmdMap["ak"] = cmdSeal;
  }
  main();
})();
