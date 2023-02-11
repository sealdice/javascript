// ==UserScript==
// @name         排序
// @author       流溪
// @version      1.0.0
// @timestamp    1675839541
// @homepageURL  https://github.com/lxy071130
// @license      MIT
// @description  本插件用于将数字从小到大排序。食用方法：.rank 值1 值2（例；.rank 1 2)
// ==/UserScript==
if (!seal.ext.find('rank')){
    ext = seal.ext.new('rank','lxy','1.0.0');
    seal.ext.register(ext);
}
const cmdRank = seal.ext.newCmdItemInfo();
cmdRank.name = 'rank';
cmdRank.help = '本插件用于将数字从小到大排序。\n食用方法：.rank 值1 值2（例；.rank 1 2)'
cmdRank.solve = (ctx, msg, cmdArgs) => {
    var arr2 = [];
    var arr = [];
    for (var z=1; z<=cmdArgs.args.length; z++)
    {
        arr2.push(Number(cmdArgs.getArgN(z)));
        arr.push(Number(cmdArgs.getArgN(z)));
        var sum = 0;
        sum = sum + cmdArgs.getArgN(z);
    };
    var arrsorted = arr.sort(function(a,b){return a>b?1:-1});
    switch(cmdArgs.getArgN(1)){
        case 'help': {
            const ret = seal.ext.newCmdExecuteResult(true);
            ret.showHelp = true;
            return ret;
        }
        default: {
            switch(cmdArgs.args.length){
                case 0:{
                    seal.replyToSender(ctx, msg, `请使用.rank help获取帮助`);
                    return seal.ext.newCmdExecuteResult(true);
                    break;
                }
                default: {
                    switch(isNaN(sum)){
                        case true: {
                            seal.replyToSender(ctx, msg, `非数值不可排序！`)
                            return seal.ext.newCmdExecuteResult(true);
                            break;
                        }
                        default: {
                            seal.replyToSender(ctx, msg, `${arr2}从小到大的排序为：${arrsorted}`);
                            return seal.ext.newCmdExecuteResult(true);
                        }
                    }
                }
            }
        }
    }
};
ext.cmdMap['rank'] = cmdRank