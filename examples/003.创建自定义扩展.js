// 扩展机制可以看做是海豹的mod管理器，可以模块化开关海豹的任意一部分
// 如常用的开启dnd扩展，关闭coc扩展，关闭自动回复等等
// 通过.ext命令来进行具体操作，所有指令必须归属于某个扩展
// 出于对公平性的考虑，js脚本不能替换内置指令和内置扩展
// 命令说明见：https://dice.weizaima.com/manual/#ext-%E6%89%A9%E5%B1%95%E7%AE%A1%E7%90%86

// 如何建立一个扩展

// 首先检查是否已经存在
if (!seal.ext.find('test')) {
  // 不存在，那么建立扩展，名为test，作者“木落”，版本1.0.0
  const ext = seal.ext.new('test', '木落', '1.0.0');
  // 注册扩展
  seal.ext.register(ext);
}
