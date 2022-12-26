// 编写代骰指令

// 先将扩展模块创建出来，如果已创建就直接使用
let ext = seal.ext.find('test');
if (!ext) {
  ext = seal.ext.new('test', '木落', '1.0.0');
  seal.ext.register(ext);
}
// 创建指令 .catch
// 这个命令的功能为，显示“试图捕捉某人”，并给出成功率
// 如果命令写“.catch @张三”，那么就会试着捕捉张三
const cmdCatch = seal.ext.newCmdItemInfo();
cmdCatch.name = 'catch';
cmdCatch.help = '捕捉某人，格式.catch <@名字>';
// 对这个指令启用使用代骰功能，即@某人时，可获取对方的数据，以对方身份进行骰点
cmdCatch.allowDelegate = true;
cmdCatch.solve = (ctx, msg, cmdArgs) => {
  const mctx = seal.getCtxProxyFirst(ctx, msg);
  let val = cmdArgs.getArgN(1);
  switch (val) {
    case 'help': {
      // 命令为 .seal help
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }
    default: {
      const text = `正在试图捕捉${mctx.player.name}，成功率为${Math.ceil(Math.random() * 100)}%`;
      seal.replyToSender(mctx, msg, text);
      return seal.ext.newCmdExecuteResult(true);
    }
  }
};
// 将命令注册到扩展中
ext.cmdMap['catch'] = cmdCatch;
