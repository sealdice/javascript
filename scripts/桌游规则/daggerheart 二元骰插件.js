// ==UserScript==
// @name         DualityDice
// @author       RO/zac
// @version      1.6.0
// @description  Daggerheart二元骰专用模式 使用方法：.dd adv/dis(优劣势) +调整值，如.dd adv +4。设置两枚十二面骰子，分别命名为hope和fear，同时掷出，将所得数值相加，结果为value。然后对比hope和fear的大小，若hope大于fear，输出value with hope；若fear大于hope，输出value with fear，若hope等于fear，输出critical success
// @timestamp    1671368035
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

// 编写一条自定义指令
// 先将扩展模块创建出来，如果已创建就直接使用
let ext = seal.ext.find('test');
if (!ext) {
    ext = seal.ext.new('test', 'twoDice', '1.6.0');
    seal.ext.register(ext);
}

//设置两枚十二面骰子，分别命名为hope和fear，同时掷出，将所得数值相加，结果为value。
// 然后对比hope和fear的大小，若hope大于fear，输出value with hope；
// 若fear大于hope，输出value with fear，若hope等于fear，输出critical success

// 创建指令 .seal
// 这个命令的功能为，显示"抓到一只海豹的文案"
// 如果命令写".seal ABC"，那么文案中将海豹命名为"ABC"
// 如果命令中没写名字，那么命名为默认值"氪豹"
const cmdSeal = seal.ext.newCmdItemInfo();
cmdSeal.name = 'dd'; // 指令名字，可用中文
cmdSeal.help = 'Daggerheart二元骰专用模式\n' +
    '基础用法：.dd [adv/dis] [固定调整值:+/-N] [随机调整值:+/-XdY]\n' +
    '多个优/劣势骰取高：.dd adv2/dis2 (数字表示骰子数量)\n' +
    '优劣势可简写：优势:[adv/a/优势/优] 劣势:[dis/d/劣势/劣]\n' +
    '组合使用可以任意顺序：.dd 1d6 a3 +4\n';
// 主函数，指令解析器会将指令信息解析，并储存在几个参数中
// ctx 主要是和当前环境以及用户相关的内容，如当前发指令用户，当前群组信息等
// msg 为原生态的指令内容，如指令文本，发送平台，发送时间等
// cmdArgs 为指令信息，会将用户发的信息进行分段，方便快速取用
cmdSeal.solve = (ctx, msg, cmdArgs) => {
    // 获取所有参数
    let args = cmdArgs.args;

    if (args.length === 1 && args[0].toLowerCase() === 'help') {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
    }

    function randomNum(minNum, maxNum) {
        switch (arguments.length) {
            case 1:
                return parseInt(Math.random() * minNum + 1, 10);
                break;
            case 2:
                return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
                break;
            default:
                return 0;
                break;
        }
    }

    let hope = randomNum(1,12);
    let fear = randomNum(1,12);
    let value = hope + fear;
    let adv_dis = 0;
    let modifier = 0;
    let diceResults = []; // 用于存储所有随机骰子的结果
    let advDisResult = ''; // 用于存储优劣势骰的结果

    // 定义优势/劣势的同义词列表
    const advantageKeywords = ['adv', 'a', '优势', '优'];
    const disadvantageKeywords = ['dis', 'd', '劣势', '劣'];

    // 解析参数
    for (let arg of args) {
        arg = arg.toLowerCase();
        // 检查是否是带数字的优势/劣势
        let advMatch = arg.match(/^(adv|a|优势|优)(\d+)$/);
        let disMatch = arg.match(/^(dis|d|劣势|劣)(\d+)$/);
        
        if (advMatch) {
            let numDice = parseInt(advMatch[2]);
            let rolls = [];
            for (let i = 0; i < numDice; i++) {
                rolls.push(randomNum(1,6));
            }
            adv_dis = Math.max(...rolls);
            advDisResult = `优势骰${numDice}个: [${rolls.join(', ')}] 取最高:${adv_dis}`;
        } else if (disMatch) {
            let numDice = parseInt(disMatch[2]);
            let rolls = [];
            for (let i = 0; i < numDice; i++) {
                rolls.push(randomNum(1,6));
            }
            adv_dis = -1 * Math.max(...rolls);
            advDisResult = `劣势骰${numDice}个: [${rolls.join(', ')}] 取最高:${-adv_dis}`;
        } else if (advantageKeywords.includes(arg)) {
            let roll = randomNum(1,6);
            adv_dis = roll;
            advDisResult = `优势骰: ${roll}`;
        } else if (disadvantageKeywords.includes(arg)) {
            let roll = randomNum(1,6);
            adv_dis = -1 * roll;
            advDisResult = `劣势骰: ${roll}`;
        } else {
            // 尝试解析为数字或随机值表达式
            let sign = 1;
            if (arg.startsWith('+')) {
                arg = arg.substring(1); // 移除加号
            } else if (arg.startsWith('-')) {
                sign = -1;
                arg = arg.substring(1); // 移除减号
            }
            // 检查是否是随机值表达式 (如 1d6)
            let diceMatch = arg.match(/^(\d+)d(\d+)$/);
            if (diceMatch) {
                let numDice = parseInt(diceMatch[1]);
                let diceSize = parseInt(diceMatch[2]);
                let rolls = [];
                let sum = 0;
                for (let i = 0; i < numDice; i++) {
                    let roll = randomNum(1, diceSize);
                    rolls.push(roll);
                    sum += roll;
                }
                modifier += sign * sum;
                diceResults.push(`${sign === 1 ? '+' : '-'}${numDice}d${diceSize}: [${rolls.join(', ')}]`);
            } else {
                // 如果不是随机值表达式，尝试解析为普通数字
                let num = parseInt(arg);
                if (!isNaN(num)) {
                    modifier += sign * num;
                }
            }
        }
    }

    value = value + adv_dis + modifier;
    let ctxname = ctx.player.name;

    // 构建骰子结果字符串
    let diceResultStr = diceResults.length > 0 ? '\n 调整值结果: ' + diceResults.join(' ') : '';

    if(hope > fear){
        seal.replyToSender(ctx, msg, `Alea iacta est【${ctxname} 】已掷下骰子... \n 希望骰:${hope} 恐惧骰:${fear} ${advDisResult} 调整值:${modifier}${diceResultStr} \n 骰值总和:${value} 希望尚存...`);
    }
    else if(hope < fear){
        seal.replyToSender(ctx, msg, `Alea iacta est【${ctxname}】 已掷下骰子... \n 希望骰:${hope} 恐惧骰:${fear} ${advDisResult} 调整值:${modifier}${diceResultStr} \n 骰值总和:${value} 直面恐惧...`);
    }
    else{
        seal.replyToSender(ctx, msg, `Alea iacta est【${ctxname} 】已掷下骰子... \n 希望骰:${hope} 恐惧骰:${fear} ${advDisResult} 调整值:${modifier}${diceResultStr} \n 骰值总和:${value} 关键成功，逆天改命!` );
    }
    return seal.ext.newCmdExecuteResult(true);
};
// 将命令注册到扩展中
ext.cmdMap['dd'] = cmdSeal;
