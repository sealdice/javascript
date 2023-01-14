// ==UserScript==
// @name         BV号解析
// @author       没病装病 & SzzRain
// @version      1.0.1
// @description  解析BV号
// @timestamp    1673315026
// @license      MIT
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==
if (!seal.ext.find('bvparse')) {
    const ext = seal.ext.new('bvparse', '没病装病 & SzzRain', '1.0.1');
    ext.onNotCommandReceived = (ctx, msg) => {
        // console.log("triggered")
        if (msg.message.startsWith("BV")) {
            let Name = msg.message;
            let url =
                "https://api.bilibili.com/x/web-interface/view?bvid=" + Name;
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
                    let BiliJson = JSON.parse(data);
                    // 找不到的话返回“{"result":{"songCount":0},"code":200}”
                    if (BiliJson.code == -400) {
                        seal.replyToSender(ctx, msg, "异常的BV号，没有结果。");
                    }
                    let MessageRet = "标题:" + BiliJson.data.title + String.fromCharCode(10);
                    MessageRet += "链接:https://www.bilibili.com/video/" + Name +String.fromCharCode(10);
                    MessageRet += "封面:" + "[CQ:image,file=" + BiliJson.data.pic + "]";
                    seal.replyToSender(ctx, msg, MessageRet);
                })
                .catch((error) => {
                    console.log("api请求错误！错误原因：" + error);
                    console.log(BiliJson)
                });
        }
    }

    // 注册扩展
    seal.ext.register(ext);
}