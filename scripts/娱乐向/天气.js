// ==UserScript==
// @name         天气查询
// @author       星尘
// @version      1.0.0
// @description  天气查询，可用.天气 <城市> (<今天/明天/后天/大后天>) 查询天气信息，第二个参数不填的话默认输出今明后三天的，如“.天气 许昌"或“。天气 许昌 今天”
// @timestamp    1672546276
// @license      Apache-2
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

if (!seal.ext.find("weather")) {
  const ext = seal.ext.new("weather", "星尘", "1.0.0");
  // qq点歌命令
  const cmdWeather = seal.ext.newCmdItemInfo();
  cmdWeather.name = "天气";
  cmdWeather.help =
    "天气查询，可用.天气 <城市> (<今天/明天/后天/大后天>) 查询天气信息，第二个参数不填的话默认输出今明后三天的";
  cmdWeather.solve = (ctx, msg, cmdArgs) => {
    let val = cmdArgs.getArgN(1);
    let dayStatus = cmdArgs.getArgN(2);
    switch (val) {
      case "help": {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
      }
      default: {
        if (!val) {
          seal.replyToSender(ctx, msg, `要输入城市的名字再查啊...`);
          return;
        }
        let musicCity = val;
        let url =
          "http://autodev.openspeech.cn/csp/api/v2.1/weather?openId=aiuicus&clientType=android&sign=android&city=" +
          musicCity;
        // 发送 GET 请求
        fetch(url)
          .then((response) => {
            // 判断响应状态码是否为 200
            if (response.ok) {
              return response.text();
            } else {
              console.log("天气api失效！");
            }
          })
          .then((data) => {
            let cityJson = JSON.parse(data);
            if (cityJson["code"] == 105) {
              seal.replyToSender(ctx, msg, "没有这个城市的天气数据哦");
            }
            let weatherDayOne =
              cityJson["data"]["list"]["0"]["province"] +
              cityJson["data"]["list"]["0"]["city"] +
              "今天(" +
              cityJson["data"]["list"]["0"]["date"] +
              ")的天气为" +
              cityJson["data"]["list"]["0"]["weather"] +
              "，最高气温" +
              cityJson["data"]["list"]["0"]["high"] +
              "度，最低气温" +
              cityJson["data"]["list"]["0"]["low"] +
              "度，有" +
              cityJson["data"]["list"]["0"]["wind"] +
              "，湿度" +
              cityJson["data"]["list"]["0"]["humidity"] +
              "，空气质量指数为" +
              cityJson["data"]["list"]["0"]["airData"] +
              "，" +
              cityJson["data"]["list"]["0"]["airQuality"];
            let weatherDayTwo =
              cityJson["data"]["list"]["1"]["province"] +
              cityJson["data"]["list"]["1"]["city"] +
              "明天(" +
              cityJson["data"]["list"]["1"]["date"] +
              ")的天气为" +
              cityJson["data"]["list"]["1"]["weather"] +
              "，最高气温" +
              cityJson["data"]["list"]["1"]["high"] +
              "度，最低气温" +
              cityJson["data"]["list"]["1"]["low"] +
              "度，有" +
              cityJson["data"]["list"]["1"]["wind"] +
              cityJson["data"]["list"]["1"]["windLevel"] +
              "级，" +
              "空气质量指数为" +
              cityJson["data"]["list"]["1"]["airData"] +
              "，" +
              cityJson["data"]["list"]["1"]["airQuality"];
            let weatherDayTHree =
              cityJson["data"]["list"]["2"]["province"] +
              cityJson["data"]["list"]["2"]["city"] +
              "后天(" +
              cityJson["data"]["list"]["2"]["date"] +
              ")的天气为" +
              cityJson["data"]["list"]["2"]["weather"] +
              "，最高气温" +
              cityJson["data"]["list"]["2"]["high"] +
              "度，最低气温" +
              cityJson["data"]["list"]["2"]["low"] +
              "度，有" +
              cityJson["data"]["list"]["2"]["wind"] +
              cityJson["data"]["list"]["1"]["windLevel"] +
              "级，" +
              "空气质量指数为" +
              cityJson["data"]["list"]["2"]["airData"] +
              "，" +
              cityJson["data"]["list"]["2"]["airQuality"];
            let weatherDayFour =
              cityJson["data"]["list"]["3"]["province"] +
              cityJson["data"]["list"]["3"]["city"] +
              "大后天(" +
              cityJson["data"]["list"]["3"]["date"] +
              ")的天气为" +
              cityJson["data"]["list"]["3"]["weather"] +
              "，最高气温" +
              cityJson["data"]["list"]["3"]["high"] +
              "度，最低气温" +
              cityJson["data"]["list"]["3"]["low"] +
              "度，有" +
              cityJson["data"]["list"]["3"]["wind"] +
              cityJson["data"]["list"]["1"]["windLevel"] +
              "级" +
              "，空气质量指数为" +
              cityJson["data"]["list"]["3"]["airData"] +
              "，" +
              cityJson["data"]["list"]["3"]["airQuality"];
            switch (dayStatus) {
              case "今天":
                seal.replyToSender(ctx, msg, weatherDayOne);
                return;
              case "明天":
                seal.replyToSender(ctx, msg, weatherDayTwo);
                return;
              case "后天":
                seal.replyToSender(ctx, msg, weatherDayTHree);
                return;
              case "大后天":
                seal.replyToSender(ctx, msg, weatherDayFour);
                return;
              default:
                let ret =
                  weatherDayOne + "\n" + weatherDayTwo + "\n" + weatherDayTHree;
                seal.replyToSender(ctx, msg, ret);
                return;
            }
            // return messageRet;
          })
          .catch((error) => {
            console.log("天气api请求错误！错误原因：" + error);
          });
        return seal.ext.newCmdExecuteResult(true);
      }
    }
  };
  // 注册命令
  ext.cmdMap["天气"] = cmdWeather;
  // 注册扩展
  seal.ext.register(ext);
}
