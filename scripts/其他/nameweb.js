// ==UserScript==
// @name         nameweb
// @author       nao
// @version      1.0.0
// @description  基于网站（https://www.qmsjmfb.com/）生成名字
// @timestamp    1672987505
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==
function web(url, body) {
    return fetch(url, {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            "cache-control": "max-age=0",
            "content-type": "application/x-www-form-urlencoded",
            "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Microsoft Edge\";v=\"108\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "sec-gpc": "1",
            "upgrade-insecure-requests": "1",
            "Referer": url,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": body,
        "method": "POST"
    });
}
var cmd = seal.ext.newCmdItemInfo();
cmd.name = 'nameweb';
cmd.help = "\n\u57FA\u4E8E\u7F51\u7AD9\uFF08https://www.qmsjmfb.com/\uFF09\u751F\u6210\u540D\u5B57\n.nameweb \n- \u5730\u57DF\u8303\u56F4\n\u53C2\u6570\uFF1Azh/en/jp/kor/er/ch\uFF08\u4E2D/\u82F1/\u65E5/\u97E9/\u4E8C\u6B21\u5143/\u6210\u8BED\uFF09\n- \u6307\u5B9A\u59D3\u6C0F\n\u53C2\u6570\uFF1A\u4EFB\u610F\u4E0D\u542B\u7A7A\u767D\u5B57\u7B26\u7684\u975E\u6570\u5B57\u7B26\n- \u751F\u6210\u6570\u91CF\n\u53C2\u6570\uFF1A\u963F\u62C9\u4F2F\u6570\u5B57\n\u4F8B\u5982\uFF1A.nameweb zh 10 \u6D77";
cmd.solve = function (ctx, msg, cmdArgs) {
    if (cmdArgs.getArgN(1) == 'help') {
        var ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
    }
    var country = 'zh';
    var urldict = {
        'zh': 'https://www.qmsjmfb.com/',
        'en': 'https://www.qmsjmfb.com/en.php',
        'kor': 'https://www.qmsjmfb.com/kor.php',
        'jp': 'https://www.qmsjmfb.com/jp.php',
        'er': 'https://www.qmsjmfb.com/erciyuan.php',
        'ch': 'https://www.qmsjmfb.com/chengyu.php'
    };
    var counArr = Object.keys(urldict);
    counArr.forEach(function (x) {
        var ret = cmdArgs.args.find(function (x2) { return x == x2; });
        if (ret)
            country = ret;
    });
    var weburl = urldict[country];
    var appoint = cmdArgs.args.find(function (x) {
        return (counArr.indexOf(x) == -1) && (isNaN(Number(x)));
    });
    if (!appoint)
        appoint = '';
    var num = cmdArgs.args.find(function (x) { return !isNaN(Number(x)); });
    if (!num)
        num = '5';
    var rettext = '';
    var body = country == 'ch' ? "xing=".concat(appoint, "&xinglength=all&minglength=all&dic=default&num=").concat(num) :
        "xing=".concat(appoint, "&sex=all&dic=default&num=").concat(num);
    web(weburl, body)
        .then(function (res) { return res.text(); })
        .then(function (res) {
        res = res.match(/<ul>(.+)<\/ul>/)[1];
        var regexp = /<li>(.+?)<\/li>/g;
        var a = ''; //seal.formatTmpl(ctx, '其它:随机名字') 有办法获取原始文案后再说……
        var b = seal.formatTmpl(ctx, '其它:随机名字_分隔符');
        var arr = [], match;
        while ((match = regexp.exec(res)) !== null) {
            arr.push(match[1]);
        }
        arr.shift(); // 网页实际返回 num+1 个名字，减掉一个
        if (country == 'ch') {
            arr.forEach(function (v, i) {
                return arr[i] = v.replace(/<name>/g, '“').replace(/<\/name>/g, '”')
                    .replace('<strong>', '<').replace('</strong>', '>\n')
                    .replace(/<p>|<\/p>/g, '');
            });
            rettext = a + arr.join('\n');
        }
        else {
            rettext = a + arr.join(b);
        }
        seal.replyToSender(ctx, msg, rettext);
    })["catch"](function (err) {
        rettext = '网络错误。';
        console.error(err);
        seal.replyToSender(ctx, msg, rettext);
    });
    return seal.ext.newCmdExecuteResult(true);
};
seal.ext.find('story').cmdMap['nameweb'] = cmd;
