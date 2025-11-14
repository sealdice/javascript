// ==UserScript==
// @name         三角机构
// @author       冰箱
// @version      1.0.0
// @description  三角机构OA系统Beta
// @timestamp    1671368035
// 2022-12-18
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

// 编写一条自定义指令
// 先将扩展模块创建出来，如果已创建就直接使用
newFunction();

function newFunction() {
    let ext = seal.ext.find('taoa1');
    if (!ext) {
        ext = seal.ext.new('taoa1', '冰箱', '1.0.0');
        seal.ext.register(ext);
    }
    // 创建指令 .seal
    const cmdTa = seal.ext.newCmdItemInfo();
    cmdTa.name = 'ta'; // 指令名字，可用中文
    cmdTa.help = '三角机构稳态OA系统已登陆。\n请使用.ta <调整参数> 向机构申请现实修改。';
    // 主函数，指令解析器会将指令信息解析，并储存在几个参数中
    // ctx 主要是和当前环境以及用户相关的内容，如当前发指令用户，当前群组信息等
    // msg 为原生态的指令内容，如指令文本，发送平台，发送时间等
    // cmdArgs 为指令信息，会将用户发的信息进行分段，方便快速取用
    cmdTa.solve = (ctx, msg, cmdArgs) => {
        // 获取第一个参数，例如 .seal A B C
        // 这里 cmdArgs.getArgN(1) 的结果即是A，传参为2的话结果是B
        let val = cmdArgs.getArgN(1);
        switch (val) {
            case 'help': {
                // 命令为 .seal help
                // 创建一个结果对象，并将showHelp标记为true，这会自动给用户发送帮助
                const ret = seal.ext.newCmdExecuteResult(true);
                ret.showHelp = true;
                return ret;
            }
            default: {
                // 命令为 .seal XXXX，取第一个参数为名字
                if (!val)
                    val = 0;
                let saveVal = Number(val);
                // 生成6个1-4之间的随机数
                const numbers = Array.from({ length: 6 }, () => Math.floor(Math.random() * 4) + 1);

                // 统计数字3出现的次数
                const countOfThree = numbers.filter(num => num === 3).length;

                // 记录结果
                const result = countOfThree + saveVal;

                // 输出结果
                console.log("生成的6个数字:", numbers);
                console.log("数字3出现的次数:", countOfThree);
                console.log("完整记录:", result);

                // 进行回复，如果是群聊发送那么在群里回复，私聊发送则在私聊回复(听起来是废话文学，但详细区别见暗骰例子)
                seal.replyToSender(ctx, msg, `6d4={${numbers}},原始骰出${countOfThree}个3，受影响后最终投出${result}个3！`);
                if (countOfThree == 3) {
                    seal.replyToSender(ctx, msg, `三重升华！本次掷骰不产生混沌,且从以下加成中选择一项:\n全员协力：为本次掷骰增加任意数量的3。\n稍后重议：补充任意3点已花费的资质保证。\n此刻之星：获得+3嘉奖。`);
                }
                return seal.ext.newCmdExecuteResult(true);
            }
        }
    };
    // 将命令注册到扩展中
    ext.cmdMap['ta'] = cmdTa;
}
