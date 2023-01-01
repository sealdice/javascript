// ==UserScript==
// @name         每日新闻与历史上的今天 
// @author       星尘
// @version      1.0.0
// @description  “.今日新闻”返回每日新闻，“.历史上的今天”返回历史上的今天，同时可作为图片api调用的两种范例
// @timestamp    1672546276
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==
if (!seal.ext.find("everyday")) {
  const ext = seal.ext.new("everyday", "星尘", "1.0.0");
  // 历史上的今天命令——api直接返回的是图片
  const cmdHistoryDay = seal.ext.newCmdItemInfo();
  cmdHistoryDay.name = "历史上的今天";
  cmdHistoryDay.help = "可用.历史上的今天 调用";
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
  // 今日新闻命令——返回json格式提取图片链接
  const cmdNewsToday = seal.ext.newCmdItemInfo();
  cmdNewsToday.name = "今日新闻";
  cmdNewsToday.help = "可用.今日新闻 调用";
  cmdNewsToday.solve = (ctx, msg, cmdArgs) => {
    let val = cmdArgs.getArgN(1);
    switch (val) {
      case "help": {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
      }
      default: {
        let url = "http://bjb.yunwj.top/php/tp/lj.php";
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
            // 返回数据如下
            // {"zt":0,"nr":"内容请求成功","tp":"http://bjb.yunwj.top/php/tp/26.jpg","tp1":"http://bjb.yunwj.top/php/tp/60.jpg","lx":"有什么问题可以联系QQ群：963076428微信号：Q3257117851"}
            // 使用[""]方式访问json对象中的tp项 
            let imgUrl = imgJson["tp"];
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
  // 注册命令
  ext.cmdMap["历史上的今天"] = cmdHistoryDay;
  ext.cmdMap["今日新闻"] = cmdNewsToday;
  // 注册扩展
  seal.ext.register(ext);
}
