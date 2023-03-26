// ==UserScript==
// @name         示例:存储数据
// @author       木落
// @version      1.0.0
// @description  投喂，格式 .投喂 <物品>
// @timestamp    1672423909
// 2022-12-31
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

// 先将扩展模块创建出来，如果已创建就直接使用
let ext = seal.ext.find('test');
if (!ext) {
  ext = seal.ext.new('test', '木落', '1.0.0');
  seal.ext.register(ext);
}
const cmdFeed = seal.ext.newCmdItemInfo();
cmdFeed.name = '投喂';
cmdFeed.help = '投喂，格式: .投喂 <物品>\n.投喂 记录 // 查看记录';
cmdFeed.solve = (ctx, msg, cmdArgs) => {
  let val = cmdArgs.getArgN(1);
  switch (val) {
    case 'help':
    case '': {
      // .投喂 help
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }
    case '列表':
    case '记录':
    case 'list': {
      const data = JSON.parse(ext.storageGet('feedInfo') || '{}');
      const lst = [];
      for (let [k, v] of Object.entries(data)) {
        lst.push(`- ${k}: 数量 ${v}`);
      }
      seal.replyToSender(ctx, msg, `投喂记录:\n${lst.join('\n')}`);
      return seal.ext.newCmdExecuteResult(true);
    }
    default: {
      const data = JSON.parse(ext.storageGet('feedInfo') || '{}');
      const name = cmdArgs.getArgN(2) || '空气';
      if (data[name] === undefined) {
        data[name] = 0;
      }
      data[name] += 1;
      ext.storageSet('feedInfo', JSON.stringify(data));
      seal.replyToSender(ctx, msg, `你给海豹投喂了${name}，要爱护动物！`);
      return seal.ext.newCmdExecuteResult(true);
    }
  }
};
// 将命令注册到扩展中
ext.cmdMap['投喂'] = cmdFeed;
ext.cmdMap['feed'] = cmdFeed;
