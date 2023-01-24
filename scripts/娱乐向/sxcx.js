// ==UserScript==
// @name         sxcx
// @author       nao
// @version      1.0.0
// @description  基于网站（https://lab.magiconch.com/nbnhhsh/）查询缩写
// @timestamp    1673593368
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

let ext = seal.ext.find('不是英文');
if (!ext) {
    ext = seal.ext.new('不是英文', 'nao', '1.0.0');
    seal.ext.register(ext);
}

const cmd = seal.ext.newCmdItemInfo();
cmd.name = 'sx'
cmd.help = `
基于网站（https://lab.magiconch.com/nbnhhsh/）查询缩写
sx <word>
例如 .sx ssss dd yysy`
cmd.solve = (ctx, msg, cmdArgs) => {
    if (cmdArgs.getArgN(1) == 'help' || cmdArgs.args.length < 1) {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
    }
    let word = { text: '' }, rettext = '>> 查询结果：\n'
    word.text = cmdArgs.args.join(',')
    fetch("https://lab.magiconch.com/api/nbnhhsh/guess", {
        "headers": {
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            "content-type": "application/json",
            "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Microsoft Edge\";v=\"108\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1"
        },
        "referrer": "https://lab.magiconch.com/nbnhhsh/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": JSON.stringify(word),
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    })
        .then(x => x.json())
        .then(x => {
            try {
                x.forEach(ele=>{
                    rettext += ele.name + ' ≈ '
                    rettext += ele.trans.join('、') + '\n'
                })
            } catch {
                rettext = '不知道捏。'
            }
            seal.replyToSender(ctx, msg, rettext)
        })
        .catch(err => {
            rettext = '网络错误。'
            console.error(err)
            seal.replyToSender(ctx, msg, rettext)
        })
    return seal.ext.newCmdExecuteResult(true)
}

ext.cmdMap['sx'] = cmd