// ==UserScript==
// @name         vs 指令
// @author       nao
// @version      1.0.0
// @description  等价于不需要艾特的 rav 指令，一种应急方案。
// @timestamp    1674238328
// @license      MIT
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

let ext = seal.ext.find('不是英文');
if (!ext) {
    ext = seal.ext.new('不是英文', 'nao', '1.0.0');
    seal.ext.register(ext);
}

function check(ctx, s) {
    let roll = Number(seal.format(ctx, '{1d100}')), ret = 1
    if (roll > s) {
        if (roll == 100 || (s < 50 && roll > 95)) {
            ret = -2
        } else {
            ret = -1
        }
    } else {
        if (roll == 1) {
            ret = 4
        }
        else if (roll < s / 5) {
            ret = 3
        }
        else if (roll < s / 2) {
            ret = 2
        } else {
            ret = 1
        }
    }
    return [roll, ret]
}

function fun(s1, s2, ctx) {
    const tmpl = {
        '1': '成功', '2': '困难成功', '3': '极难成功', '4': '大成功',
        '-1': '失败', '-2': '大失败'
    }
    const [a1, a2] = check(ctx, s1)
    const [b1, b2] = check(ctx, s2)
    let text = `${a1}/${s1}=${tmpl[a2]}\n${b1}/${s2}=${tmpl[b2]}\n`

    if (a2 < 0 && b2 < 0) return text + '双重失败。'
    if (a2 > b2) {
        text += '先手胜利。'
    } else if (a2 == b2) {
        if (s1 > s2) {
            text += '先手技能/属性更高而取胜。'
        } else if (s1 == s2) {
            text += '达成僵局或需重骰。'
        } else {
            text += '后手技能/属性更高而取胜。'
        }
    } else {
        text += '后手胜利。'
    }
    return text
}

let cmd = seal.ext.newCmdItemInfo()
cmd.name = 'vs'
cmd.help = `
vs 对抗检定
等价于不需要艾特的 rav 指令，一种应急方案。
A：.vs <技能>  发起对抗
B：.vs <技能>  接受对抗
`
cmd.solve = (ctx, msg, argv) => {
    let ret = seal.ext.newCmdExecuteResult(true), text = ''
    if (argv.getArgN(1) == 'help' || argv.args.length < 1) {
        ret.showHelp = true;
        return ret;
    }
    const skill = argv.getArgN(1), valn = '$gfirstSkill'
    const [First] = seal.vars.intGet(ctx, valn)
    if (First == 0) {
        let [s] = seal.vars.intGet(ctx, skill)
        s = s == 0 ? Number(skill) : s
        if (isNaN(s)) s = 1
        seal.vars.intSet(ctx, valn, s)
        text = `{$t玩家}发起了【${skill}】对抗！`

    } else {
        let [s] = seal.vars.intGet(ctx, skill)
        s = s == 0 ? Number(skill) : s
        if (isNaN(s)) s = 1
        text = `{$t玩家}接受了【${skill}】对抗！\n`
        text += fun(First, s, ctx)
        seal.vars.intSet(ctx, valn, 0)
    }
    seal.replyToSender(ctx, msg, seal.format(ctx, text))
    return ret
}

ext.cmdMap['vs'] = cmd