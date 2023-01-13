// ==UserScript==
// @name         ArkDice人物作成
// @author       SzzRain
// @version      1.0.1
// @description  ArkDice规则人物作成，使用方式: .ark (<数量>)
// @timestamp    1673598189
// @license      MIT
// @homepageURL  https://github.com/Szzrain
// ==/UserScript==
if (!seal.ext.find('arkdice-roll')) {
    const ext = seal.ext.new('arkdice-roll', 'SzzRain', '1.0.1');
    // 创建一个命令
    const cmdark = seal.ext.newCmdItemInfo();
    cmdark.name = 'ark';
    cmdark.help = '使用说明:.ark (<数量>) // 制卡指令，返回<数量>组人物属性';
    cmdark.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1)
        switch (val) {
            case 'help': {
                const ret = seal.ext.newCmdExecuteResult(true);
                ret.showHelp = true;
                return ret;
            }
            default: {
                let times = parseInt(val)
                let result = seal.format(ctx,"由{$t玩家}进行的ark人物作成\n")
                let split = seal.formatTmpl(ctx, "COC:制卡_分隔符")
                if (times >= 10) {
                    result += "制卡次数过多，请输入不大于10的数字"
                    seal.replyToSender(ctx, msg, result)
                    return seal.ext.newCmdExecuteResult(true);
                }
                for (let i = 0; i < times; i++) {
                    let ret = seal.format(ctx,
                        "身体素质：{$t身体素质=4d6*3+8} 生理强度：{$t生理强度=4d6*3+8}\n" +
                        "反应机动：{$t反应机动=4d6*3+8} 精神意志：{$t精神意志=4d6*3+8}\n" +
                        "经验智慧：{$t经验智慧=4d6*3+8} 源石技艺：{$t源石技艺=4d6*3+8}\n" +
                        "个人魅力：{$t个人魅力=3d6*5} 信誉：{$t信誉=1d6*9}\n" +
                        "总计：{$t不含信誉=$t身体素质+$t生理强度+$t反应机动+$t精神意志+$t经验智慧+$t源石技艺+$t个人魅力}/{$t总计=$t信誉+$t不含信誉}")
                    result = result + ret + split
                }
                seal.vars.strSet(ctx, "$t制卡结果文本", result)
                seal.replyToSender(ctx, msg, result)
            }
        }
        return seal.ext.newCmdExecuteResult(true);
    }
    // 注册命令
    ext.cmdMap['ark'] = cmdark;

    // 注册扩展
    seal.ext.register(ext);
}