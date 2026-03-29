// ==UserScript==
// @name         每日新闻与历史上的今天与摸鱼人日历
// @author       陆天行
// @version      1.0.3
// @description  “.今日新闻”返回每日新闻，“.历史上的今天”返回历史上的今天，“.摸鱼人日历”返回摸鱼人日历，本脚本修改自sealdice官方脚本仓库托管星尘的每日新闻与历史上的今天，本人更换了可用的API并添加了摸鱼人日历功能
// @timestamp    1738082743
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==
if (!seal.ext.find("DailyInfoByLTX")) {
    const ext = seal.ext.new("DailyInfoByLTX", "陆天行", "1.0.3");
    const cmdNewsToday = seal.ext.newCmdItemInfo();
    cmdNewsToday.name = "今日新闻";
    cmdNewsToday.help = "可用.今日新闻 调用,API爆炸请发邮件给ci_tfee_lutianxing@163.com";
    cmdNewsToday.solve = (ctx, msg, cmdArgs) => {
      let val = cmdArgs.getArgN(1);
      switch (val) {
        case "help": {
          const ret = seal.ext.newCmdExecuteResult(true);
          ret.showHelp = true;
          return ret;
        }
        default: {
          let url = "https://api.03c3.cn/api/zb?type=jsonImg";
          // 发送 GET 请求
          fetch(url)
            .then((response) => {
              // 判断响应状态码是否为 200
              if (response.ok) {
                return response.text();
              } else {
                console.log(response.status);
                console.log("api失效！");
              }
            })
            .then((data) => {
              //返回数据转换为json对象以可以访问
              let imgJson = JSON.parse(data);
              // 使用[""]方式访问json对象中的tp项 
              let index = imgJson["data"];
              let imgUrl = index["imageurl"];
              // 拼装返回的图片消息
              let messageRet = "[CQ:image,file="+imgUrl+",cache=0]";
              // 发出去
              seal.replyToSender(ctx, msg, messageRet);
            })
            .catch((error) => {
              console.log("api请求错误！错误原因：" + error);
            });
          return seal.ext.newCmdExecuteResult(true);
       }
      }
    };

    const cmdHistoryDay = seal.ext.newCmdItemInfo();
    cmdHistoryDay.name = "历史上的今天";
    cmdHistoryDay.help = "可用.历史上的今天 调用,API爆炸请发邮件给ci_tfee_lutianxing@163.com";
    cmdHistoryDay.solve = (ctx, msg, cmdArgs) => {
      let val = cmdArgs.getArgN(1);
      switch (val) {
        case "help": {
          const ret = seal.ext.newCmdExecuteResult(true);
          ret.showHelp = true;
          return ret;
        }
        default: {
          // api返回图片的话直接用cq码发出去就可以了，注意在cq码里面加上cache=0，刷新gocq的缓存
          seal.replyToSender(
            ctx,
            msg,
            `[CQ:image,file=https://xiaoapi.cn/API/lssdjt_pic.php,cache=0]`
          );
          return seal.ext.newCmdExecuteResult(true);
        }
      }
    };

    const cmdMoyuCalendar = seal.ext.newCmdItemInfo();
    cmdMoyuCalendar.name = "摸鱼人日历";
    cmdMoyuCalendar.help = "可用.摸鱼人日历 调用,API爆炸请发邮件给ci_tfee_lutianxing@163.com";
    cmdMoyuCalendar.solve = (ctx, msg, cmdArgs) => {
      let val = cmdArgs.getArgN(1);
      switch (val) {
        case "help": {
          const ret = seal.ext.newCmdExecuteResult(true);
          ret.showHelp = true;
          return ret;
        }
        default: {
          let url = "https://api.vvhan.com/api/moyu?type=json";
          fetch(url)
            .then((response) => {
              if (response.ok) {
                return response.text();
              } else {
                console.log(response.status);
                console.log("api失效！");
              }
            })
            .then((data) => {
              let imgJson = JSON.parse(data);
              let imgUrl = imgJson["url"];
              let messageRet = "[CQ:image,file="+imgUrl+",cache=0]";
              seal.replyToSender(ctx, msg, messageRet);
            })
            .catch((error) => {
              console.log("api请求错误！错误原因：" + error);
            });
          return seal.ext.newCmdExecuteResult(true);
       }
      }
    };
    // 注册命令
    ext.cmdMap["今日新闻"] = cmdNewsToday;
    ext.cmdMap["历史上的今天"] = cmdHistoryDay;
    ext.cmdMap["摸鱼人日历"] = cmdMoyuCalendar;
    // 注册扩展
    seal.ext.register(ext);
}
