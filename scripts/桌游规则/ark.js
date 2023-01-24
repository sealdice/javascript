"use strict";
// ==UserScript==
// @name         Ark 扩展
// @author       SzzRain & nao
// @version      1.1.0
// @description  集成明日方舟同人规则的相关的指令
// @timestamp    1674238328
// @license      MIT
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==
exports.__esModule = true;
var ext = seal.ext.find('ark');
if (!ext) {
    ext = seal.ext["new"]('ark', 'nao & SzzRain', '1.1.0');
    seal.ext.register(ext);
}
function checkRaw(expText, ctx) {
    var rex = expText.match(/^(d[1-3])/);
    if (rex) {
        expText = expText.replace(/^(d[1-3])/, '');
        var tb = {
            'd1': '-10', 'd2': '-25', 'd3': '-40'
        };
        expText += tb[rex[1]];
    }
    var val = Number(seal.format(ctx, '{' + expText + '}'));
    var roll = Number(seal.format(ctx, '{1d100}'));
    var res = '', s = true;
    if (roll > 95 || val < 0) {
        res = '大失败';
        s = false;
    }
    else if (roll < 5 && roll < val) {
        res = '大成功';
    }
    else if (roll < val) {
        res = '成功';
    }
    else {
        res = '失败';
        s = false;
    }
    return [s, [expText, roll, val, res]];
}
function check(expText, ba, ctx) {
    var arr = expText.split('&'), text = '';
    if (arr.length > 1) {
        var s_1 = true, res_1 = [];
        arr.forEach(function (v) { return res_1.push(checkRaw(v, ctx)); });
        res_1.forEach(function (v) {
            s_1 = s_1 && v[0];
            text += "".concat(v[1][0], " = ").concat(v[1][1], " / ").concat(v[1][2], " | ").concat(v[1][3], "\n");
        });
        if (s_1) {
            text = '联合成功：\n' + text;
        }
        else {
            text = '联合失败：\n' + text;
        }
    }
    else {
        var v = checkRaw(ba ? expText + '+2d10' : expText, ctx);
        text = "".concat(v[1][0], " = ").concat(v[1][1], " / ").concat(v[1][2], " | ").concat(v[1][3]);
    }
    return text;
}
var rk = seal.ext.newCmdItemInfo();
rk.name = 'rk';
rk.help = "\n\u6CF0\u62C9TRPG ver:3.2 \u68C0\u5B9A\n.rk \u7A7A\u53C2\u6570\u8FD4\u56DE rk help\n.rk <\u8868\u8FBE\u5F0F> [\u539F\u56E0] \u5355\u6B21\u68C0\u5B9A\n\u8868\u8FBE\u5F0F\u683C\u5F0F\uFF1A\n- \u6B21\u6570#\u6280\u80FD \u591A\u6B21\u68C0\u5B9A\n- \u6280\u80FD&\u6280\u80FD \u8054\u5408\u68C0\u5B9A\n- \u6280\u80FD+[\u6295\u9AB0\u8868\u8FBE\u5F0F] \u4FEE\u6B63\u6280\u80FD\u503C\n- b <\u6280\u80FD \u6218\u6597\u68C0\u5B9A\uFF08battle\uFF09\uFF0C\u81EA\u52A8\u52A0\u4E0A2d10\n- [\u96BE\u5EA6]\u6280\u80FD \u96BE\u5EA6\u68C0\u5B9A \n\u3010\u53EF\u4F7F\u7528 difficulty \u53C2\u6570\u7B80\u5316\u8F93\u5165\u3011\n\u3010 d1/d2/d3 \u5BF9\u5E94\u8F83\u96BE/\u56F0\u96BE/\u6781\u96BE \u3011\n\u4F8B\u5982\uFF1A.rk 3#\u6E90\u77F3\u7406\u8BBA&\u533B\u5B66 \u4E09\u6B21\u8054\u5408\u68C0\u5B9A\n.rk b \u529B\u91CF \u52A0\u503C\u4E3A2d10\u7684\u529B\u91CF\u68C0\u5B9A\uFF08\u6218\u6597\u968F\u673A\u6570\uFF09\n.rk d2\u529B\u91CF \u7B49\u540C .rk \u56F0\u96BE\u529B\u91CF\n";
rk.solve = function (ctx, msg, argv) {
    var ret = seal.ext.newCmdExecuteResult(true), text = '';
    if (argv.getArgN(1) == 'help' || argv.args.length < 1) {
        ret.showHelp = true;
        return ret;
    }
    var ba = (argv.getArgN(1).toLowerCase() == 'b');
    var expText = ba ? argv.getArgN(2) : argv.getArgN(1);
    expText = expText.replace(/较难/g, 'd1').replace(/困难/g, 'd2').replace(/极难/g, 'd3');
    var rex = msg.message.match(/.+rk\s*(\d+)#/);
    var num = rex ? Number(rex[1]) : 1;
    if (num > 10) {
        text = '检定次数过多。';
    }
    else {
        for (var i = 0; i < num; i++) {
            console.log;
            text += check(expText, ba, ctx) + '\n';
        }
    }
    seal.replyToSender(ctx, msg, text);
    return ret;
};
var cmdark = seal.ext.newCmdItemInfo();
cmdark.name = 'ark';
cmdark.help = '使用说明:.ark (<数量>) // 制卡指令，返回<数量>组人物属性';
cmdark.solve = function (ctx, msg, cmdArgs) {
    var val = cmdArgs.getArgN(1);
    switch (val) {
        case 'help': {
            var ret = seal.ext.newCmdExecuteResult(true);
            ret.showHelp = true;
            return ret;
        }
        default: {
            var times = parseInt(val);
            var result = seal.format(ctx, "由{$t玩家}进行的ark人物作成\n");
            var split = seal.formatTmpl(ctx, "COC:制卡_分隔符");
            if (times >= 10) {
                result += "制卡次数过多，请输入不大于10的数字";
                seal.replyToSender(ctx, msg, result);
                return seal.ext.newCmdExecuteResult(true);
            }
            for (var i = 0; i < times; i++) {
                var ret = seal.format(ctx, "身体素质：{$t身体素质=4d6*3+8} 生理强度：{$t生理强度=4d6*3+8}\n" +
                    "反应机动：{$t反应机动=4d6*3+8} 精神意志：{$t精神意志=4d6*3+8}\n" +
                    "经验智慧：{$t经验智慧=4d6*3+8} 源石技艺：{$t源石技艺=4d6*3+8}\n" +
                    "个人魅力：{$t个人魅力=3d6*5} 信誉：{$t信誉=1d6*9}\n" +
                    "总计：{$t不含信誉=$t身体素质+$t生理强度+$t反应机动+$t精神意志+$t经验智慧+$t源石技艺+$t个人魅力}/{$t总计=$t信誉+$t不含信誉}");
                result = result + ret + split;
            }
            seal.vars.strSet(ctx, "$t制卡结果文本", result);
            seal.replyToSender(ctx, msg, result);
        }
    }
    return seal.ext.newCmdExecuteResult(true);
};
// 注册命令
ext.cmdMap['ark'] = cmdark;
ext.cmdMap['rk'] = rk;
