// ==UserScript==
// @name         emojikitchen/emoji 合成
// @author       nao
// @version      0.1.0
// @description  基于谷歌的 https://www.gstatic.com/android/keyboard/emojikitchen/ 的获取 emoji合成图 。帮助指令：emoji help
// @timestamp    1674405766
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

let ext = seal.ext.find('不是英文');
if (!ext) {
    ext = seal.ext.new('不是英文', 'nao', '1.0.0');
    seal.ext.register(ext);
}

const cmd = seal.ext.newCmdItemInfo()
cmd.name = 'emoji'
cmd.help = 'emoji <emoji+emoji> \n例如：.emoji 😑+😈'
cmd.solve = (ctx, msg, argv) => {
    const ret = seal.ext.newCmdExecuteResult(true)
    let e = argv.getArgN(1).match(/^(.+?)\+(.+?)$/), text = '格式错误。'
    if (e) {
        if ((e[1] + e[2]).length == 4) {

            let fun = (x) => x.codePointAt(0).toString(16)
            let url = 'https://www.gstatic.com/android/keyboard/emojikitchen/20201001/' + `u${fun(e[1])}/u${fun(e[1])}_u${fun(e[2])}.png`
            fetch(url)
                .then(x => {
                    if (x.ok) text = '[图:' + url + ']'
                    seal.replyToSender(ctx, msg, text)
                })
                .catch(x => {
                    text = '未找到相关图片 或 网络错误。'
                    console.log(x)
                    seal.replyToSender(ctx, msg, text)
                })
        } else {
            seal.replyToSender(ctx, msg, text)
        }
    } else {
        seal.replyToSender(ctx, msg, text)
    }

    return ret
}

ext.cmdMap['emoji'] = cmd