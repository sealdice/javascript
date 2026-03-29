// ==UserScript==
// @name         DualityDice
// @author       RO/zac
// @version      1.8.0
// @description  Daggerheart二元骰专用模式 使用方法：.dd adv/dis(优劣势) +调整值，如.dd adv +4。设置两枚十二面骰子，分别命名为hope和fear，同时掷出，将所得数值相加，结果为value。然后对比hope和fear的大小，若hope大于fear，输出value with hope；若fear大于hope，输出value with fear，若hope等于fear，输出critical success
// @timestamp    1671368035
// 2025-05-05
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==
(() => {
  // src/dice-logic.ts
  function randomNum(minNum, maxNum) {
    if (maxNum === void 0) {
      maxNum = minNum;
      minNum = 1;
    }
    return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
  }
  function parseArgsAndRoll(args, userName) {
    let hope = randomNum(12);
    let fear = randomNum(12);
    let adv_dis = 0;
    let modifier = 0;
    let diceResults = [];
    let advDisResult = "";
    let dc = null;
    const filteredArgs = args.filter((arg) => {
      const dcMatch = arg.match(/^\[(\d+)\]$/);
      if (dcMatch) {
        dc = parseInt(dcMatch[1], 10);
        return false;
      }
      return true;
    });
    const mathArgs = [];
    const remainingArgs = filteredArgs.filter((arg) => {
      arg = arg.toLowerCase();
      const advMatch = arg.match(/^(adv|优势|优)(\d*)$/);
      const disMatch = arg.match(/^(dis|劣势|劣)(\d*)$/);
      if (advMatch) {
        const numDiceStr = advMatch[2] || "1";
        const numDice = parseInt(numDiceStr);
        const rolls = [];
        for (let i = 0; i < numDice; i++) {
          rolls.push(randomNum(6));
        }
        adv_dis = Math.max(...rolls);
        advDisResult = `优势骰${numDice}个: [${rolls.join(", ")}] 取最高:${adv_dis}`;
        return false;
      } else if (disMatch) {
        const numDiceStr = disMatch[2] || "1";
        const numDice = parseInt(numDiceStr);
        const rolls = [];
        for (let i = 0; i < numDice; i++) {
          rolls.push(randomNum(6));
        }
        adv_dis = -1 * Math.max(...rolls);
        advDisResult = `劣势骰${numDice}个: [${rolls.join(", ")}] 取最高:${-adv_dis}`;
        return false;
      }
      mathArgs.push(arg);
      return true;
    });
    const mathExpression = mathArgs.join("").toLowerCase();
    const regex = /([+-])?(\d*d\d+|\d+)/g;
    let match;
    while ((match = regex.exec(mathExpression)) !== null) {
      const sign = match[1] === "-" ? -1 : 1;
      let term = match[2];
      if (term.startsWith("d")) {
        term = "1" + term;
      }
      const diceMatch = term.match(/^(\d+)d(\d+)$/);
      if (diceMatch) {
        const numDice = parseInt(diceMatch[1]);
        const diceSize = parseInt(diceMatch[2]);
        const rolls = [];
        let sum = 0;
        for (let i = 0; i < numDice; i++) {
          const roll = randomNum(diceSize);
          rolls.push(roll);
          sum += roll;
        }
        modifier += sign * sum;
        diceResults.push(`${sign === 1 ? "+" : "-"}${term}: [${rolls.join(", ")}]`);
      } else {
        const num = parseInt(term);
        if (!isNaN(num)) {
          modifier += sign * num;
        }
      }
    }
    const value = hope + fear + adv_dis + modifier;
    const diceResultStr = diceResults.length > 0 ? "\n随机调整值结果: " + diceResults.join(" ") : "";
    let reply = `Alea iacta est【${userName}】已掷下骰子...
`;
    reply += `希望骰:${hope} 恐惧骰:${fear} ${advDisResult} 调整值:${modifier}${diceResultStr}
`;
    if (dc !== null) {
      reply += `骰值总和:${value} / DC:${dc} `;
    } else {
      reply += `骰值总和:${value} `;
    }
    if (hope === fear) {
      reply += "关键成功，逆天改命!";
    } else if (dc !== null) {
      const success = value >= dc;
      if (hope > fear) {
        reply += success ? "希望成功" : "希望失败";
      } else {
        reply += success ? "恐惧成功" : "恐惧失败";
      }
    } else {
      if (hope > fear) {
        reply += "希望尚存...";
      } else {
        reply += "直面恐惧...";
      }
    }
    return {
      hope,
      fear,
      value,
      adv_dis,
      modifier,
      diceResultStr,
      advDisResult,
      reply
    };
  }

  // src/index.ts
  function main() {
    let ext = seal.ext.find("daggerheart");
    if (!ext) {
      ext = seal.ext.new("daggerheart", "Daggerheart", "1.8.0");
      seal.ext.register(ext);
    }
    const actionData = {};
    const cmdDaggerheart = seal.ext.newCmdItemInfo();
    cmdDaggerheart.name = "dd";
    cmdDaggerheart.help = "Daggerheart二元骰专用模式\n基础用法：.dd [adv/dis] [固定调整值:+/-N] [随机调整值:+/-XdY]\n多个优/劣势骰取高：.dd adv2/dis2 (数字表示骰子数量)\n优劣势可简写：优势:[adv/优势/优] 劣势:[dis/劣势/劣]\n组合使用可以任意顺序：.dd 1d6 a3 +4\nDC检定: .dd [DC]\n.dd getAction //查询当前所有用户掷骰的次数\n.dd clearAction //重置记录\n";
    cmdDaggerheart.solve = (ctx, msg, cmdArgs) => {
      const userId = ctx.player.userId;
      const userName = ctx.player.name;
      if (cmdArgs.args.length === 1) {
        const action = cmdArgs.args[0].toLowerCase();
        if (action === "help") {
          const ret = seal.ext.newCmdExecuteResult(true);
          ret.showHelp = true;
          return ret;
        }
        if (action === "getaction") {
          let reply = "当前掷骰次数记录:\n";
          if (Object.keys(actionData).length === 0) {
            reply += "暂无记录。";
          } else {
            for (const id in actionData) {
              reply += `${actionData[id].name}: ${actionData[id].count}次
`;
            }
          }
          seal.replyToSender(ctx, msg, reply);
          return seal.ext.newCmdExecuteResult(true);
        }
        if (action === "clearaction") {
          for (const key in actionData) {
            delete actionData[key];
          }
          seal.replyToSender(ctx, msg, "所有用户的掷骰次数记录已重置。");
          return seal.ext.newCmdExecuteResult(true);
        }
      }
      if (!actionData[userId]) {
        actionData[userId] = { name: userName, count: 0 };
      }
      actionData[userId].name = userName;
      actionData[userId].count++;
      const result = parseArgsAndRoll(cmdArgs.args, userName);
      seal.replyToSender(ctx, msg, result.reply);
      return seal.ext.newCmdExecuteResult(true);
    };
    ext.cmdMap["dd"] = cmdDaggerheart;
  }
  main();
})();
