// ==UserScript==
// @name         魔法猫猫救世界规则
// @author       暮雪酱
// @version      1.0.1
// @description  为魔法猫猫而生（魔法猫猫规则插件）
// @timestamp    1678244828855
//@diceRequireVer 1.2.0
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

//Magiccattrpg
const thecat={
    "name":"MagicCatSave",
    "fullname":"魔法猫猫救世界",
    "authors": ["暮雪酱"],
    "version": "1.0.1",
    "updatedTime": "20230307",
    "templateVer": "1.0",

    "nameTmplate":{
        "game":{
            "template":"{$t玩家_RAW}伤口{伤口}疼痛{疼痛}/{疼痛极限}猫粮丸{猫粮丸}等级{等级}",
            "helpText": "自动设置名片"
        }
    },

    "attrConfig":{
        //stshow置顶内容
        "top":['可爱','机敏','迅猛','伤口','猫粮丸','等级','疼痛'],
        "sortBy":"name",
        "ignores":["疼痛极限"],
        "showAs":{
            "疼痛":"{疼痛}/{疼痛极限}","XP":"{XP}"
        },
        "setter":null,
    },
    

    "setConfig":{
        "diceSides": 6,
        "enableTip": "已切换至6面骰，开启魔法猫猫扩展",
        "keys": ["MagicCat","magiccat"],
        "relatedExt": ["MagicCat"],
    },

    "defaults":{
        "猫粮丸":2,
        "疼痛极限":2,
        "伤口上限":3,
    },
    "defaultsComputed":{
        "等级":"XP<5?1,XP<11?2,XP<17?3,XP<23?4,XP<30?5,XP<37?6,XP<45?7,XP<53?8,XP<62?9,1?10"
    },
    "alias":{
        "XP":["经验","xp"]
    },

    "textMap": {
        "trpg-test": {
            "设置测试_成功": [
                ["设置完成", 1]
            ]
        }
    },
    "textMapHelpInfo": null
}

try {
    seal.gameSystem.newTemplate(JSON.stringify(thecat))
} catch (e) {
    // 如果扩展已存在，或加载失败，那么会走到这里
    console.log(e)
}
var exti=seal.ext.find('MagicCat');
if (!seal.ext.find('MagicCat')){
    //检查扩展不存在
    exti=seal.ext.new('MagicCat','暮雪酱','1.0.0');//建立新扩展
    seal.ext.register(exti);
}

let cmdc =seal.ext.newCmdItemInfo();
cmdc.name='cat';//指令名
cmdc.help='.cat 难度 属性 （奖励骰）//进行检定，注意指令格式';//帮助内容
cmdc.solve=(ctx,msg,cmdArgs)=>{
    let name=seal.format(ctx,"{$t玩家}");
    //判断第一个参数
    switch(cmdArgs.getArgN(1)){
        case"":
        case"help":{
            const ret = seal.ext.newCmdExecuteResult(true);
            ret.showHelp = true;
            return ret;}

    //第一个参数为不为空或者help时进行判定
    default:{
    //判断第二个参数
    switch(cmdArgs.getArgN(2)){
        //第二个参数为空时，不进行判定并给出提示
        case "":{
            seal.replyToSender(ctx,msg,"几个骰子？你说句话呀！（未输入属性值）");
            return seal.ext.newCmdExecuteResult(false)
        }
        //第二个参数不为空时，进行判定
        default:{
            let judge=cmdArgs.getArgN(1);//获取判定等级
            let attribute0=cmdArgs.getArgN(2);//获取属性值
            let bonus=parseInt(cmdArgs.getArgN(3)||0);//获取奖励骰数
            let wounds=seal.format(ctx,`{伤口}`);//获取惩罚骰数
            let xp=parseInt(seal.format(ctx,"{XP}"));//获取经验值备用

            //读取属性值或使用输入值
            if (!parseInt(attribute0)){attribute=parseInt(seal.format(ctx,`{${attribute0}}`))}
            else{attribute=parseInt(attribute0)};

            //计算骰池中骰子个数
            let pool=attribute+bonus-wounds;
            //判断骰池个数并判定
            if (pool<=0){//没有骰子
                seal.replyToSender(ctx, msg, `${name}没有骰点机会！`);
                return seal.ext.newCmdExecuteResult(false);
            }
            else if(pool>=10){//骰子数过多，不予计算
                seal.replyToSender(ctx,msg,`${name}真的有这么多骰子吗？`);
                return seal.ext.newCmdExecuteResult(false)
            }
            else{
                let times=0;
                let result=[];let suc=0
                while (times<pool){//进行多轮骰点并判定计算
                    let dice=Math.round(Math.random()*5+1);
                    result.push(dice);times+=1;
                    if (dice>=judge){
                        suc+=1;
                    }
                };

                if (suc==0){
                    seal.replyToSender(ctx,msg,`${name}骰点结果为[${result}]失败\n没能做到你想做的，并且可能会遭遇一场节外生枝`);xp+=1;seal.vars.intSet(ctx,"XP",xp)//自动加经验
                    return seal.ext.newCmdExecuteResult(true);}
                else if (suc==1){
                    seal.replyToSender(ctx,msg,`${name}骰点结果为[${result}]成功\n你做到了，但是好像出了点问题呢……`);
                    return seal.ext.newCmdExecuteResult(true);}
                else if(suc==2){
                    seal.replyToSender(ctx,msg,`${name}骰点结果为[${result}]成功\n你做到了！祝福你！`);
                    return seal.ext.newCmdExecuteResult(true);}
                else if(suc==3){
                    seal.replyToSender(ctx,msg,`${name}骰点结果为[${result}]成功\n你做到了！并且似乎有好事发生。`);
                    return seal.ext.newCmdExecuteResult(true);}
                else{
                    seal.replyToSender(ctx,msg,`${name}骰点结果为[${result}超级成功\n完美完成！厉害的小猫咪！给你点奖励吧！`);
                return seal.ext.newCmdExecuteResult(true);}
            }
        }
    }
    }
    }

};

exti.cmdMap["cat"]=cmdc;

