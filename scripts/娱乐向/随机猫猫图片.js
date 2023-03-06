// ==UserScript==
// @name         随机猫猫图片
// @author       憧憬少
// @version      1.0.0
// @description  随机发一张AI生成的猫猫图片。来自https://thiscatdoesnotexist.com/
// @timestamp    1676445548
// 2023-02-15 15:19:08
// @license      MIT
// @homepageURL  
// ==/UserScript==

(() => {
  // src/index.ts
  function main() {
    let ext = seal.ext.find("random-img");
    if (!ext) {
      ext = seal.ext.new("random-img", "憧憬少", "1.0.0");
      seal.ext.register(ext);
    }
    const cmdSeal = seal.ext.newCmdItemInfo();
    cmdSeal.name = "随机猫猫图片";
    cmdSeal.help = ".随机猫猫图片 //随机发一张AI生成的猫猫图片。来自https://thiscatdoesnotexist.com/\n.随机猫猫图片 help //查看此帮助";
    cmdSeal.solve = (ctx, msg, cmdArgs) => {
      let val = cmdArgs.getArgN(1);
      switch (val) {
        case "help": {
          const ret = seal.ext.newCmdExecuteResult(true);
          ret.showHelp = true;
          return ret;
        }
        default: {
          seal.replyToSender(ctx, msg, `[CQ:image,file=https://thiscatdoesnotexist.com/,cache=0]`);
          return seal.ext.newCmdExecuteResult(true);
        }
      }
    };
    ext.cmdMap["随机猫猫图片"] = cmdSeal;
  }
  main();
})();
