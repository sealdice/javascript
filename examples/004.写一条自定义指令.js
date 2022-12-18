// 编写一条自定义指令
// 先将扩展模块创建出来，如果已创建就直接使用
let ext = seal.ext.find('test');
if (!ext) {
  ext = seal.ext.new('test', '木落', '1.0.0');
  seal.ext.register(ext);
}
// 创建指令 .seal
// 这个命令的功能为，显示“抓到一只海豹的文案”
// 如果命令写“.seal ABC”，那么文案中将海豹命名为“ABC”
// 如果命令中没写名字，那么命名为默认值“氪豹”
const cmdSeal = seal.ext.newCmdItemInfo();
cmdSeal.name = 'seal'; // 指令名字，可用中文
cmdSeal.help = '召唤一只海豹，可用.seal <名字> 命名';
// 主函数，指令解析器会将指令信息解析，并储存在几个参数中
// ctx 主要是和当前环境以及用户相关的内容，如当前发指令用户，当前群组信息等
// msg 为原生态的指令内容，如指令文本，发送平台，发送时间等
// cmdArgs 为指令信息，会将用户发的信息进行分段，方便快速取用
cmdSeal.solve = (ctx, msg, cmdArgs) => {
  // 获取第一个参数，例如 .seal A B C
  // 这里 cmdArgs.getArgN(1) 的结果即是A，传参为2的话结果是B
  let val = cmdArgs.getArgN(1);
  switch (val) {
    case 'help': {
      // 命令为 .seal help
      // 创建一个结果对象，并将showHelp标记为true，这会自动给用户发送帮助
      const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
      return ret;
    }
    default: {
      // 命令为 .seal XXXX，取第一个参数为名字
      if (!val) val = '氪豹';
      // 进行回复，如果是群聊发送那么在群里回复，私聊发送则在私聊回复(听起来是废话文学，但详细区别见暗骰例子)
      seal.replyToSender(ctx, msg, `你抓到一只海豹！取名为${val}\n它的逃跑意愿为${Math.ceil(Math.random() * 100)}`);
      return seal.ext.newCmdExecuteResult(true);
    }
  }
};
// 将命令注册到扩展中
ext.cmdMap['seal'] = cmdSeal;
