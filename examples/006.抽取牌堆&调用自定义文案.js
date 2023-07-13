// ==UserScript==
// @name         抽取牌堆&调用自定义文案
// @author       nao
// @version      1.0.0
// @description  示例：抽取牌堆&调用自定义文案
// @timestamp    1672066028
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

let ext = seal.ext.find('test')
if (!ext) {
  ext = seal.ext.new('test', '木落', '1.0.0');
  seal.ext.register(ext);
}

const cmd = seal.ext.newCmdItemInfo();
cmd.name = 'drawpc';
cmd.help = '抽取一个调查员';
cmd.solve = (ctx, msg, cmdArgs) => {
  // 抽牌
  let result = seal.deck.draw(ctx, "调查员", true);
  // 是否发生错误
  if (result.err) {
    seal.replyToSender(ctx, msg, result.exists ?  result.err : "牌堆不存在。" );
    return seal.ext.newCmdExecuteResult(true);
  }
  // 赋值自定义文案 其他:抽牌_结果前缀 中的变量
  seal.vars.strSet(ctx,"$t牌组","调查员");
  // 获取自定义文案
  let text = seal.formatTmpl(ctx,"其他:抽牌_结果前缀");
  // 连接文案和抽取结果
  text += result.result;
  seal.replyToSender(ctx, msg, text);
  return seal.ext.newCmdExecuteResult(true);

};
ext.cmdMap['drawpc'] = cmd;
