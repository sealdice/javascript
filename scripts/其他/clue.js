// ==UserScript==
// @name         clue:线索
// @author       nao
// @version      0.1.0
// @description  模仿塔骰的线索记录功能
// @timestamp    1674126169
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

let ext = seal.ext.find('clue');
if (!ext) {
    ext = seal.ext.new('clue', 'nao', '1.0.0');
    seal.ext.register(ext);
}

let cmd = seal.ext.newCmdItemInfo()

cmd.name = 'clue'
cmd.help = `
clue/线索 线索记录指令！
- show 查看。
- rm <id> 删除对应线索。
- clr/clear 清空所有线索。
- reply 录入线索后是否提示
【默认不提示，为 false 】
- 其他视为需记录文本。
例如：.clue 这是一条线索：水是有毒的。
`
cmd.disabledInPrivate = true
cmd.solve = (ctx, msg, argv) => {
    const key = 'clue:' + msg.groupId
    let ret = seal.ext.newCmdExecuteResult(true), map = new Map(JSON.parse(ext.storageGet(key) || '[]')), text = ''
    if (!map.has('id')) {
        map.set('id', 0)
        map.set('isreply', false)
    }
    switch (argv.getArgN(1)) {
        case 'help':
            ret.showHelp = true
            return ret
        case 'reply':
            map.set('isreply', !map.get('isreply'))
            text = '已修改为：' + map.get('isreply')
            break;
        case 'show':
            text = '群内记录的线索：\n'
            map.forEach((v, k) => {
                if (typeof k == 'number') text += `[${k}]${v}\n`
            })
            break;
        case 'rm':
            let a2 = Number(argv.getArgN(2))
            if (map.has(a2)) {
                map.delete(a2)
                text = '完成。'
            } else {
                text = '没有找到 ' + a2
            }
            break;
        case 'clr':
        case 'clear':
            map.clear()
            text = '线索已经清空。'
            break;
        default:
            let id = map.get('id') + 1
            map.set(id, argv.args.join(' '))
            map.set('id', id)
            if (map.get('isreply')) {
                text = '已录入线索：' + id
            }
    }
    ext.storageSet(key, JSON.stringify([...map]))
    if (text != '') seal.replyToSender(ctx, msg, text)
    return ret
}

ext.cmdMap['clue'] = cmd
ext.cmdMap['线索'] = cmd