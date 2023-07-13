// ==UserScript==
// @name         008.读取玩家或群组数据
// @author       nao
// @version      1.0.0
// @description  示例：008.读取玩家或群组数据
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
cmd.name = 'info';
cmd.help = '抽取一个调查员';
cmd.solve = (ctx, msg, cmdArgs) => {
  // 遍历一个对象的非函数类型的属性
  let fun = (obj) => Object.entries(obj).forEach(a => typeof obj[a[0]] !== 'function' ? text += `${a[0]}:${a[1]}\n` : null);
  let text = "群数据\n";
  // 群组数据一般储存在 ctx.group 详细定义可见 examples_ts/seal.d.ts
  fun(ctx.group);
  text += "玩家数据\n";
  fun(ctx.player);
  // 角色卡数据
  text += "当前角色卡数据\n";
  let [vm] = ctx.chVarsGet()
  vm.iterate((k,v)=>{text+=`${k}:${v}`})
  text += "\n----\n修改后角色卡数据\n"
  // 通常不需要也不建议使用 vm 来修改角色卡 使用 vars 即可
  seal.vars.intSet(ctx,"新属性",10)
  vm.iterate((k,v)=>{text+=`${k}:${v}\n`})
  seal.replyToSender(ctx, msg, text);
  return seal.ext.newCmdExecuteResult(true);
};
ext.cmdMap['info'] = cmd;

export { }
