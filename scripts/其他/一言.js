// ==UserScript==
// @name         一言
// @author       流溪
// @version      1.0.0
// @description  输入"一言"即可得到一句话。
// @timestamp    1676706471
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==
if (!seal.ext.find('一言')){
    ext = seal.ext.new('一言','流溪','1.0.0');
    seal.ext.register(ext);
    ext.onNotCommandReceived = (ctx, msg) => {
        if(msg.message == '一言'){
            const url = 'https://v.api.aa1.cn/api/yiyan/index.php';
            fetch(url)
                .then((response) => {
                    // 判断响应状态码是否为 200
                    if (response.ok) {
                        return response.text();
                    } else {
                        console.log("api失效！请联系作者。");
                    }
                })
                .then((data) => {
                    a = data.toString();
                    b = a.replace("<p>","").replace("</p>","")
                    seal.replyToSender(ctx, msg, `${b}`);
                })
        }
    }
}