// ==UserScript==
// @name         Vaesen
// @author       浣熊旅記
// @version      1.1.0
// @description  北欧奇谭规则检定
// @timestamp    1677126666
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

let ext = seal.ext.find('vaesen');
if (!ext) {
  ext = seal.ext.new('vaesen', '浣熊旅記', '1.0.0');
  seal.ext.register(ext);
}

const cmdSeal = seal.ext.newCmdItemInfo();
cmdSeal.name = 'rvs';
cmdSeal.help = '.rvs <x> // 投掷x个六面骰';
cmdSeal.solve = (ctx, msg, cmdArgs) => {
  let ret = seal.ext.newCmdExecuteResult(true), text = '', roller = seal.format(ctx,"{$t玩家_RAW}"), suc1 = 0, res;
  if (cmdArgs.getArgN(1) == 'help' || cmdArgs.getArgN(1) == '') {
      ret.showHelp = true;
      return ret;
  } else if (cmdArgs.getArgN(1) == '1' || cmdArgs.getArgN(1) == 1) {
    res = Math.floor(Math.random() * 6) + 1;
    if (res == 6) {suc1 += 1};
    text = roller + '掷骰1次：[' + res + ']，成功' + suc1 + '次。';
  }
  let vsDice = parseInt(cmdArgs.getArgN(1)), mytext = '', res2 = Math.floor(Math.random() * 6) + 1, val, suc2;
  if (vsDice == 0) {
    val = 1
  } else if (vsDice > 0 && vsDice <= 10) {
    val = 2
  } else if (vsDice > 10) {
    val = 3
  } else {
    val = 4
  }; 
  switch (val) {
    case 1: {
      text = '错误：无法掷骰0次。'
      break;
    }
    case 2: {
      if (res2 == 6) {suc2 = 1} else {suc2 = 0};
      for (i = 0; i < vsDice - 1; i++) {
        res = Math.floor(Math.random() * 6) + 1; 
        if (res == 6) {suc2 += 1};
        mytext += res + '、';
        text = roller + '掷骰' + vsDice + '次：[' + mytext + res2 + ']，成功' + suc2 +'次。';
      }
      break;
    }
    case 3: {
      text = '错误：掷骰次数过多。'
      break;
    }
    default: {
      text = '错误：表达式错误或无法为文本掷骰。'
    }
  }
  if (text != '') seal.replyToSender(ctx, msg, text)
  return ret
};
ext.cmdMap['rvs'] = cmdSeal;
