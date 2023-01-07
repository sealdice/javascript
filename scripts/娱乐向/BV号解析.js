// ==UserScript==
// @name         BV号解析
// @author       没病装病
// @version      1.1
// @description  解析BV号获取视频的标题、封面与链接。（.BV123）
// @timestamp    1673080260
// ==/UserScript==
if (!seal.ext.find("bilibili")) {
  const ext = seal.ext.new("bilibili", "没病装病", "1.1");
  const cmdbilibili = seal.ext.newCmdItemInfo();
  cmdbilibili.name = "BV";
  cmdbilibili.help ="BV号速查";
  cmdbilibili.solve = (ctx, msg, cmdArgs) => {
    let val = cmdArgs.getArgN(1);
    switch (val) {
      case "help": {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
      }
      default: {
        let Name = val;
        let url =
          "https://api.bilibili.com/x/web-interface/view?bvid=BV" + Name;
        // 发送 GET 请求
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
            let BiliJson = JSON.parse(data);
            // 找不到的话返回“{"result":{"songCount":0},"code":200}”
            if (BiliJson.code == -400) {
              seal.replyToSender(ctx, msg, "异常的BV号，没有结果。");
            }
            let MessageRet = "标题:" + BiliJson.data.title + String.fromCharCode(10);
            MessageRet += "链接:https://www.bilibili.com/video/BV" + val +String.fromCharCode(10);
            MessageRet += "封面:" + "[CQ:image,file=" + BiliJson.data.pic + "]";
            seal.replyToSender(ctx, msg, MessageRet);
          })
          .catch((error) => {
            console.log("api请求错误！错误原因：" + error);
            console.log(BiliJson)
          });
        return seal.ext.newCmdExecuteResult(true);
      }
    }
  };
  // 注册命令
  ext.cmdMap["BV"] = cmdbilibili;
  // 注册扩展
  seal.ext.register(ext);
}
