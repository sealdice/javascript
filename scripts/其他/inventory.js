// ==UserScript==
// @name         物品栏/背包
// @author       JohNSoN
// @version      1.0.0
// @description  记录持有物品的插件
// @timestamp    1679489585
// 2023-03-22 20:53:05
// @license      The Unlicense
// @homepageURL  https://github.com/Xiangze-Li/sealdice-addon
// ==/UserScript==

let ext = seal.ext.find('inventory');
if (!ext) {
    ext = seal.ext.new('inventory', 'JohNSoN', '1.0.0');
    seal.ext.register(ext);
}

const cmd = seal.ext.newCmdItemInfo();
cmd.name = 'inventory'; // 指令名字，可用中文
cmd.help = `inventory/i/物品 跑团物品栏
=== 功能 ===
为每个群聊中的每个玩家记录物品栏, 每个条目都可搭配描述信息.
=== 用法 ===
.i show/list/ls/列表
    列出当前物品栏
.i find/cat/查找 <物品名>
    查找名为 <物品名> 的物品
.i add/添加 <物品名> [描述信息]
    添加名为 <物品名> 的物品, 可选地添加描述信息
.i remove/rm/del/移除 <物品名>
    移除名为 <物品名> 的物品
.i modify/mod/edit/修改 <物品名> [描述信息]
    修改名为 <物品名> 的物品的描述信息, 描述信息可以留空
.i clear/clr/清空
    清空物品栏
`;
cmd.solve = (ctx, msg, cmdArgs) => {
    let op = cmdArgs.getArgN(1);
    let key = `inventory:${ctx.group.groupId}:${ctx.player.userId}`;
    let inv = new Map(JSON.parse(ext.storageGet(key) || '[]'));
    let rpl = `<${ctx.player.name}>`;
    let needRefresh = false;
    let retHelp = (err) => {
        if (err) {
            seal.replyToSender(ctx, msg, err);
        }
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
    };
    let obj2Str = (obj, desc) => { return `${obj}${desc ? `(${desc})` : ''}` };

    let obj = cmdArgs.getArgN(2);
    let desc = cmdArgs.getRestArgsFrom(3);
    let objEmpty = (obj === undefined || obj === null || obj === '');
    let has = !objEmpty && inv.has(obj);
    let descStorage = has ? inv.get(obj) : '';

    switch (op) {
        case 'show': case 'list': case 'ls': case '列表': {
            if (inv.size > 0) {
                rpl += '目前持有的物品有:\n';
                for (const [k, v] of inv) {
                    rpl += obj2Str(k, v) + '\n';
                }
            } else {
                rpl += '目前没有持有物';
            }
            break;
        }
        case 'find': case 'cat': case '查找': {
            if (objEmpty) return retHelp('物品名为空');
            if (has) {
                rpl += `拥有物品 ${obj2Str(obj, descStorage)}`;
            } else {
                rpl += `没有物品 ${obj}`;
            }
            break;
        }
        case 'add': case '添加': {
            if (objEmpty) return retHelp('物品名为空');
            if (has) {
                rpl += `已经拥有物品 ${obj2Str(obj, descStorage)}`;
            } else {
                inv.set(obj, desc);
                needRefresh = true;
                rpl += `新增物品 ${obj2Str(obj, desc)}`;
            }
            break;
        }
        case 'remove': case 'rm': case 'del': case '移除': {
            if (objEmpty) return retHelp('物品名为空');
            if (has) {
                rpl += `已经删除物品 ${obj2Str(obj, descStorage)}`;
                inv.delete(obj);
                needRefresh = true;
            } else {
                rpl += `没有物品 ${obj}`;
            }
            break;
        }
        case 'modify': case 'mod': case 'edit': case '修改': {
            if (objEmpty) return retHelp('物品名为空');
            if (has) {
                rpl += `修改物品信息 ${obj2Str(obj, descStorage)} => ${desc}`;
                inv.set(obj, desc);
                needRefresh = true;
            } else {
                rpl += `没有物品 ${obj}`;
            }
            break;
        }
        case 'clear': case 'clr': case '清空': {
            inv = new Map();
            needRefresh = true;
            rpl += '已清空物品栏';
            break;
        }
        case 'help': default: {
            return retHelp();
        }
    }

    if (needRefresh) ext.storageSet(key, JSON.stringify([...inv]));

    seal.replyToSender(ctx, msg, rpl);
    return seal.ext.newCmdExecuteResult(true);
};
// 将命令注册到扩展中
ext.cmdMap['inventory'] = cmd;
ext.cmdMap['i'] = cmd;
ext.cmdMap['物品'] = cmd;
