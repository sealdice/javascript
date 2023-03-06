// ==UserScript==
// @name         跑团时间条
// @author       nao
// @version      0.1.0
// @description  记录团内时间线，使用.progress help获取帮助。
// @timestamp    1673593368
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

let cmd = seal.ext.newCmdItemInfo()
let ext = seal.ext.find('不是英文');
if (!ext) {
    ext = seal.ext.new('不是英文', 'nao', '1.0.0');
    seal.ext.register(ext);
}

function t2zh(str) {
    let min = Number(str)
    let date = Math.floor(min / (24 * 60))
    min -= date * 24 * 60
    let hou = Math.floor(min / 60)
    min -= hou * 60
    return `${date} 天 ${hou} 时 ${min} 分`
}

function t2t(a, b) {
    let tt = {
        '分钟': 1,
        '分': 1,
        '小时': 60,
        '时': 60,
        '天': 24 * 60
    }
    return Number(a) * tt[b]
}

cmd.name = '跑团时间条'
cmd.help = `
progress/时间条 <time> 记录团内外时间线
- 无参数 查看信息。
- 数字时间单位 计算团内时间 PC跑了多久？
- 时间单位数字 计算团外时间 PL跑了多久？
【可用加减号代表正负】
例如：
.时间条 17分钟 
.progress 分钟-6
`
cmd.solve = (ctx, msg, argv) => {
    let result = seal.ext.newCmdExecuteResult(true)
    if (argv.getArgN(1) == 'help') {
        result.showHelp = true
        return result
    }
    let key = 'cmd/时间条' + msg.groupId
    if (argv.args.length < 1) {
        let hiy1 = ext.storageGet(key + '/1'), hiy2 = ext.storageGet(key + '/2')
        seal.replyToSender(ctx, msg, `团内耗时：${t2zh(hiy1)}\n团外用时：${t2zh(hiy2)}`)
        return result
    }
    let match = argv.args.join('').match(/([\-\+]?)(\d+)([天时分钟小]+)/), text = ''
    if (match) {
        let history = Number(ext.storageGet(key + '/1')) || 0
        let now = match[1] != '-' ? history + t2t(match[2], match[3]) : history - t2t(match[2], match[3])
        ext.storageSet(key + '/1', String(now))
        seal.replyToSender(ctx, msg, `团内耗时：${t2zh(now)} | ${now}min`)
    } else {
        match = argv.args.join('').match(/([天时分钟小]+)([\-\+]?)(\d+)/)
        if (match) {
            let history = Number(ext.storageGet(key + '/1')) || 0
            let now = match[2] != '-' ? history + t2t(match[3], match[1]) : history - t2t(match[3], match[1])
            ext.storageSet(key + '/2', String(now))
            seal.replyToSender(ctx, msg, `团外耗时：${t2zh(now)} | ${now}min`)
        } else {
            seal.replyToSender(ctx, msg, '无法理解的参数：' + argv.args.join(''))
        }
    }
    return result
}

ext.cmdMap['时间条'] = cmd
ext.cmdMap['progress'] = cmd
