// ==UserScript==
// @name         BRP规则
// @author       暮雪酱
// @version      1.0.0
// @description  brp游戏基础规则
// @timestamp    
//@diceRequireVer 1.2.0
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

//COC6trpg
const thecat={
    "name":"BRP",
    "fullname":"BRPRules",
    "authors": ["暮雪酱"],
    "version": "1.0.0",
    "updatedTime": "20230321",
    "templateVer": "1.0",

    "nameTmplate":{
        "game":{
            "template":"{$t玩家_RAW}HP{HP}DEX{敏捷}POW{意志}",
            "helpText": "自动设置名片"
        }
    },

    "attrConfig":{
        //stshow置顶内容
        "top":['力量','敏捷','智力','体质','外貌','意志','体型','幸运'],
        "sortBy":"name",
        "ignores":["力气","耐力","灵巧","魅力"],
        "showAs":{
            "HP":"{HP}/{生命值}","PP":"{PP}/{能量值}"
        },
        "setter":null,
    },
    

    "setConfig":{
        "diceSides": 100,
        "enableTip": "已切换至100面骰，开启BRP规则扩展",
        "keys": ["BRP","brp"],
        "relatedExt": ["BRP扩展"],
    },

    "defaults":{
        "估价":15,"艺术":5,"议价":5,"搏斗":25,"攀爬":40,
        "手艺":5,"爆破":1,"伪装":1,"车辆驾驶":20,"礼仪":5,
        "话术":5,"精细操作":5,"急救":30,"擒抱":25,"躲藏":10,
        "洞察":5,"跳跃":25,"知识":5,"聆听":25,"武术":1,
        "医学":5,"导航":10,"表演":5,"说服":15,"驾驶":1,
        "精神治疗":1,"维修":15,"查阅资料":25,"骑术":1,
        "感知":10,"妙手":5,"侦查":25,"地位":15,"潜行":10,
        "战术":1,"游泳":25,"教导":10,"投掷":25,"追踪":10,    
    },
    "defaultsComputed":{
        "闪避":"敏捷*2",
        "飞行":"敏捷*0.5",
        "母语":"智力*5",
        "博弈":"智力+意志",
        "能量放射":"敏捷*2",
        "DB":"(力量+体型)<13?-1D6,(力量+体型)<17?-1D4,(力量+体型)<25?0,(力量+体型)<33?1D4,(力量+体型)<41?1D6,(力量+体型)<57?2D6,1?3D6",
        "力气":"力量*5",
        "耐力":"体质*5",
        "幸运":"意志*5",
        "灵巧":"敏捷*5",
        "魅力":"外貌*5",
    },
    "alias":{
        "力量":["str","STR"],"体质":["con","CON"],"体型":["SIZ","SIZ"],
        "智力":["INT","INT"],"意志":["pow","POW"],"敏捷":["DEX","dex"],
        "外貌":["APP","APP"],"车辆驾驶":["汽车驾驶"],"洞察":["心理学"],
        "精神治疗":["精神分析","精分"],"查阅资料":["图书馆","图书馆使用"],
        "感知":["嗅觉","触觉","味觉"],"地位":["信用评级","信誉"],"能量放射":["施法"],
        "HP":["hp"],"PP":["pp"],"MOV":["mov","移动力"],"幸运":["运气"],
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

// 首先检查是否已经存在
let ext = seal.ext.find('BRP扩展');
if (!ext) {
    // 不存在，那么建立扩展，名为，作者“”，版本1.0.0
    ext = seal.ext.new('BRP扩展', '暮雪酱', '1.1.0');
    // 注册扩展
    seal.ext.register(ext);
}

function makecheck(ctx,value,dic) {
    let check=value;
    //checkit
    let dice=dic;
    let text0=`${dice}/${seal.format(ctx,`${value}`)}`;
    let text='';
    if (dice<=(check/5)){
        text='特殊'+seal.formatTmpl(ctx,'COC:判定_必须_困难_成功');
    }
    else if (dice<=(check)){
        text=seal.formatTmpl(ctx,'COC:判定_成功_普通');
    }
    else{
        if (check<11){
            if (dice<96){
                text=seal.formatTmpl(ctx,'COC:判定_必须_大成功_失败');
            }
            else{
                text=seal.formatTmpl(ctx,'COC:判定_大失败');
            }
        }
        else if(check<31){
            if (dice<97){
                text=seal.formatTmpl(ctx,'COC:判定_必须_极难_失败');
            }
            else{
                text=seal.formatTmpl(ctx,'COC:判定_大失败');
            }
        }
        else if(check<51){
            if (dice<98){
                text=seal.formatTmpl(ctx,'COC:判定_必须_困难_失败');
            }
            else{
                text=seal.formatTmpl(ctx,'COC:判定_大失败');
            }
        }
        else if(check<71){
            if (dice<99){
                text=seal.formatTmpl(ctx,'COC:判定_失败');
            }
            else{
                text=seal.formatTmpl(ctx,'COC:判定_大失败');
            }
        }
        else{
            text=seal.formatTmpl(ctx,'COC:判定_失败');
        }

    }
    text0+=' '+text;
    return text0;  
}

const cmd = seal.ext.newCmdItemInfo();
cmd.name = 'ba'; // 指令名字，可用中文
cmd.help = '.ba <属性> (数值)//进行鉴定\n.ba <属性> (数值) @//进行代骰鉴定';
cmd.allowDelegate = true;
cmd.solve = (ctx, msg, cmdArgs) => {
    //获取代骰数据
    let mctx=seal.getCtxProxyFirst(ctx,cmdArgs);
    let val = cmdArgs.getArgN(1);
    switch (val) {
        case '':
        case 'help': {
            const ret = seal.ext.newCmdExecuteResult(true);
            ret.showHelp = true;
            return ret;
        }
        default: {
            //计算判定用的值
            let check=0;
            if (!parseInt(val)){
                if (parseInt(cmdArgs.getArgN(2))){
                    check=parseInt(cmdArgs.getArgN(2))
                }
                else{check=seal.format(mctx,`{${val}}`)}
            }
            else{
                check=parseInt(val);
            };
            //用函数进行判定
            let print=makecheck(mctx,check,seal.format(ctx,`{1d100}`));
            seal.replyToSender(mctx, msg, `${seal.format(mctx,'{$t玩家}')}：${print}`);
            return seal.ext.newCmdExecuteResult(true);
            
        }
    }
};
// 将命令注册到扩展中
ext.cmdMap['ba'] = cmd;

//简短的判定
function makeacheck(ctx,value,dice) {
    let check=value;
    //checkit
    let dicev=dice;
    let text0=`${dicev}/${check}`;
    let text='';
    if (dicev==0){
        text0='自动失败'
    }
    else if(dicev==100){
        text0='自动成功'
    }
    else if(dicev==101){
        text0='出错了'
    }
    else{
    if (dicev<=(check/5)){
        text='特殊成功';
    }
    else if (dicev<=(check)){
        text='成功';
    }
    else{
        if (check<11){
            if (dicev<96){
                text='失败';
            }
            else{
                text='大失败';
            }
        }
        else if(check<31){
            if (dicev<97){
                text='失败';
            }
            else{
                text='大失败';
            }
        }
        else if(check<51){
            if (dicev<98){
                text='失败';
            }
            else{
                text='大失败';
            }
        }
        else if(check<71){
            if (dicev<99){
                text='失败';
            }
            else{
                text='大失败';
            }
        }
        else{
            text='失败';
        }

    }
    }
    text0+=' '+text;
    return text0;  
}
//判断是否调取
function makejudge(ctx,val){
    let check;
    if (!parseInt(val)){
        check=parseInt(seal.format(ctx,`{${val}}`))
    }
    else{
        check=parseInt(val);
    };
    return check
}
//对抗表
function confrontation(check1,check2){
            const dvalue=Math.ceil(Number(check1)/5)-Math.ceil(Number(check2)/5);
            switch(dvalue){
                case-9:dice=5;break;
                case-8:dice=10;break;
                case-7:dice=15;break;
                case-6:dice=20;break;
                case-5:dice=25;break;
                case-4:dice=30;break;
                case-3:dice=35;break;
                case-2:dice=40;break;
                case-1:dice=45;break;
                case 0:dice=50;break;
                case 1:dice=55;break;
                case 2:dice=60;break;
                case 3:dice=65;break;
                case 4:dice=70;break;
                case 5:dice=75;break;
                case 6:dice=80;break;
                case 7:dice=85;break;
                case 8:dice=90;break;
                case 9:dice=95;break;
                default:if(dvalue<-9){dice=0}else if(dvalue>9){dice=100}else{dice=101};
            }
            return dice;
        }

const cmdv = seal.ext.newCmdItemInfo();
cmdv.name = 'bav'; // 指令名字，可用中文
cmdv.help = '.bav <属性>（<属性>）@被动方//主动与他人按brp对抗表进行对抗';
cmdv.disabledInPrivate=true;
cmdv.allowDelegate=true;
cmdv.solve = (ctx, msg, cmdArgs) => {
    let mctx=seal.getCtxProxyFirst(ctx,cmdArgs);
    let val = cmdArgs.getArgN(1);
    switch (val) {
        case '':
        case 'help': {
            const ret = seal.ext.newCmdExecuteResult(true);
            ret.showHelp = true;
            return ret;
        }
        default: {
            //获取双方技能
            let check1;let check2;
            if (cmdArgs.getArgN(2)){
                check1=makejudge(ctx,val);
                check2=makejudge(mctx,cmdArgs.getArgN(2));
            }
            else{
                check1=makejudge(ctx,val);
                check2=makejudge(mctx,val);
            };
            //let active=seal.vars.intGet(ctx,'{意志}');
            //let passtive=seal.vars.intGet(mctx,'{意志}');
            //用对抗表得出出目
            let active=confrontation(check1,check2)
            let passtive=confrontation(check2,check1)
            //判定
            let print1=makeacheck(ctx,active,seal.format(ctx,'{1d100}'));
            let print2=makeacheck(mctx,passtive,seal.format(mctx,'{1d100}'));
            seal.replyToSender(mctx, msg, `${seal.format(ctx,'{$t玩家}')}：${print1}\n${seal.format(mctx,'{$t玩家}')}：${print2}`);
            return seal.ext.newCmdExecuteResult(true);
        }
    }
};
// 将命令注册到扩展中
ext.cmdMap['bav'] = cmdv;
   
