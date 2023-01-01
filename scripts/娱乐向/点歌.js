// ==UserScript==
// @name         点歌 
// @author       星尘
// @version      1.0.0
// @description  点歌，返回能直接播放的音乐卡片，方便放bgm。可用".点歌 <歌名 (作者)>"或".网易云 <歌名 (作者)>"调用，前者是qq音乐，后者是网易云音乐，作者是可选参数，方便精准检索，如".点歌 稻香"或".网易云 稻香 周杰伦"
// @timestamp    1672546276
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==
if (!seal.ext.find("music")) {
  const ext = seal.ext.new("music", "星尘", "1.0.0");
  // qq点歌命令
  const cmdQQMusic = seal.ext.newCmdItemInfo();
  cmdQQMusic.name = "点歌";
  cmdQQMusic.help = "qq点歌，可用.点歌 <歌名 (作者)> 作者可以加也可以不加";
  cmdQQMusic.solve = (ctx, msg, cmdArgs) => {
    let val = cmdArgs.getArgN(1);
    switch (val) {
      case "help": {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
      }
      default: {
        if (!val) {
          seal.replyToSender(ctx, msg, `要输入歌名啊...`);
        }
        let musicName = val;
        let url =
          "https://c.y.qq.com/soso/fcgi-bin/music_search_new_platform?searchid=53806572956004615&t=1&aggr=1&cr=1&catZhida=1&lossless=0&flag_qc=0&p=1&n=2&w=" +
          musicName;
        // 发送 GET 请求
        fetch(url)
          .then((response) => {
            // 判断响应状态码是否为 200
            if (response.ok) {
              return response.text();
            } else {
              console.log("qq音乐api失效！");
            }
          })
          .then((data) => {
            let musicJson = JSON.parse(data.replace(/callback\(|\)/g, ""));
            if (musicJson["data"]["song"]["list"] == 0) {
              seal.replyToSender(ctx, msg, "没找到这首歌...");
              //   return "没找到这首歌...";
            }
            let musicId =
              musicJson["data"]["song"]["list"]["0"]["f"].match(/^\d+/)[0];
            let messageRet = "[CQ:music,type=qq,id=" + musicId + "]";
            seal.replyToSender(ctx, msg, messageRet);
            // return messageRet;
          })
          .catch((error) => {
            console.log("qq音乐api请求错误！错误原因：" + error);
          });
        return seal.ext.newCmdExecuteResult(true);
      }
    }
  };
  // 网易云点歌命令
  const cmdCloudMusic = seal.ext.newCmdItemInfo();
  cmdCloudMusic.name = "网易云";
  cmdCloudMusic.help =
    "网易云点歌，可用.网易云 <歌名 (作者)> 作者可以加也可以不加";
  cmdCloudMusic.solve = (ctx, msg, cmdArgs) => {
    let val = cmdArgs.getArgN(1);
    switch (val) {
      case "help": {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
      }
      default: {
        if (!val) {
          seal.replyToSender(ctx, msg, `要输入歌名啊...`);
        }
        let musicName = val;
        let url =
          "https://api-music.imsyy.top/cloudsearch?keywords=" + musicName;
        // 发送 GET 请求
        fetch(url)
          .then((response) => {
            // 判断响应状态码是否为 200
            if (response.ok) {
              return response.text();
            } else {
              console.log(response.status);
              console.log("网易云音乐api失效！");
            }
          })
          .then((data) => {
            let musicJson = JSON.parse(data);
            // 找不到的话返回“{"result":{"songCount":0},"code":200}”
            if (musicJson["result"]["songCount"] == 0) {
              seal.replyToSender(ctx, msg, "没找到这首歌...");
              // return "没找到这首歌...";
            }
            let musicId = musicJson["result"]["songs"]["0"]["id"];
            let messageRet = "[CQ:music,type=163,id=" + musicId + "]";
            seal.replyToSender(ctx, msg, messageRet);
          })
          .catch((error) => {
            console.log("网易云音乐api请求错误！错误原因：" + error);
            console.log(musicJson)
          });
        return seal.ext.newCmdExecuteResult(true);
      }
    }
  };
  // 注册命令
  ext.cmdMap["点歌"] = cmdQQMusic;
  ext.cmdMap["网易云"] = cmdCloudMusic;
  // 注册扩展
  seal.ext.register(ext);
}
