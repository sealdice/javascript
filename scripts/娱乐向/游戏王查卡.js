// ==UserScript==
// @name         游戏王查卡
// @author       nao
// @version      1.0.0
// @description  基于网站（https://ygocdb.com/）查询游戏王卡牌
// @timestamp    1673593368
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

let cmd = seal.ext.newCmdItemInfo();
let ext = seal.ext.find('不是英文');
if (!ext) {
    ext = seal.ext.new('不是英文', 'nao', '1.0.0');
    seal.ext.register(ext);
}
const cmdkey = 'cmd/ygosh'
cmd.name = 'ygosh'
cmd.help = `
基于网站（https://ygocdb.com/）查询游戏王卡牌
ygosh 
- word 任意关键词
- next 下一页结果
例如 .ygosh 青眼白龙`
cmd.solve = (ctx, msg, cmdArgs) => {
    if (cmdArgs.getArgN(1) == 'help' || cmdArgs.args.length < 1) {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
    }
    const key = cmdArgs.getArgN(1), mapkey = `${cmdkey}:${ctx.isPrivate ? msg.sender.userId : msg.groupId}`
    let ret = ''
    let data = ext.storageGet(cmdkey) || '[]'
    let map = new Map(JSON.parse(data))
    switch (key) {
        case 'next':
            ret = '没有更多结果了。'
            if (map.has(mapkey)) {
                let [pa, now, ls] = map.get(mapkey), ls2 = []
                ret = `第 ${pa}/${Math.ceil(ls.length/3)} 页`
                ls2 = ls.slice(now, now + 3) // 4,7
                pa++
                now += 3
                if (ls.length < now) {
                    map.delete(mapkey)
                } else {
                    map.set(mapkey, [pa, now, ls])
                    ext.storageSet(cmdkey, JSON.stringify([...map]))
                }
            }
            seal.replyToSender(ctx, msg, ret)
            break;
        default:
            ret = '查询结果'
            fetch("https://ygocdb.com/?search=" + cmdArgs.args.join(' ')).then(x => x.text())
                .then(text => {
                    let [list, ls2] = [[], []]
                    text.match(/<img data-original="(.*?)!half">/g).forEach(x => {
                        list.push(x.match(/<img data-original="(.*?)!half">/)[1])
                    })
                    if (list.length > 3) {
                        ret += '(第 1 页)'
                        map.set(mapkey, [2, 4, list])
                        ext.storageSet(cmdkey, JSON.stringify([...map]))
                        console.error(ext.storageGet(cmdkey))
                    }
                    ls2 = list.slice(0, 3)
                    ls2.forEach(x => ret += '[图:' + x + ']')
                    seal.replyToSender(ctx, msg, ret)
                })
                .catch(err => {
                    ret = '网络错误。'
                    console.error(err)
                    seal.replyToSender(ctx, msg, ret)
                })
    }
    return seal.ext.newCmdExecuteResult(true)
}

ext.cmdMap['ygosh'] = cmd;