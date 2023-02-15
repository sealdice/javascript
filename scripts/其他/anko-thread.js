// ==UserScript==
// @name         NGA安科扩展
// @author       憧憬少
// @version      1.0.0
// @description  提供一些对NGA安科帖子的查询和吞楼检查，使用前需要填写你的NGA账号登录后的Cookie值
// @timestamp    1676284056
// 2023-2-13 18:27:36
// @license      MIT
// @homepageURL  https://github.com/ChangingSelf/sealdice-js-ext-anko-thread
// ==/UserScript==

(() => {
  // src/cookie.ts
  /**
   * NGA需要登录才能查看大部分信息，所以需要你填写登录后的Cookie值
   * 获取步骤（网上搜索“浏览器获取Cookie”，有图更清晰）：
   * 1.在浏览器登录NGA后，保持在NGA网页，F12键打开开发者工具，在标签页找到Network
   * 2.刷新网页观察Network选项卡的变化，在filter那一行找到Doc筛选器，筛选得到当前网页的请求响应行
   * 3.在上述行的右栏的Headers选项卡中，找到Request Headers下的Cookie，它很长的，应该不会找不到
   * 4.将其复制粘贴到下面这个COOKIE常量的初始值内
  */
  const COOKIE = "";

  // src/index.ts
  const PARA = {
    "headers": {
      "accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
      "Cookie": COOKIE
    }
  };
  const STORAGE_KEY = "ankoThread";//存储用的key，没有特殊需求不必改
  const DOMAIN_NAME = "ngabbs.com";//nga的域名，要是某个域名崩了，你可以在这里换其他的域名
  const HELP = `<尖括号内为必填参数，写的时候不带尖括号>
[方括号内为可选参数，写的时候不带方括号]
# 后面为注释，解释命令的作用

.安科 吞楼检查 [第几页] [帖子tid]
# 默认为最新页，tid默认为你使用“记录”添加的内容

.安科 记录 <帖子tid>
# 记录帖子的tid，每人只有一个记录位

.安科 我的帖子
# 查看自己已经记录的帖子的链接

.安科 停留时间 [第几页]
# 默认查看帖子在首页停留时间
`;
  function queryTid(ext, qq) {
    const data = JSON.parse(ext.storageGet(STORAGE_KEY) || "{}");
    let tid = -1;
    if (qq in data && data[qq].length > 0) {
      tid = data[qq][0];
    }
    return tid;
  }
  function main() {
    let ext = seal.ext.find("ankoThread");
    if (!ext) {
      ext = seal.ext.new("ankoThread", "憧憬少", "1.0.0");
      seal.ext.register(ext);
    }
    const cmdSeal = seal.ext.newCmdItemInfo();
    cmdSeal.name = "安科";
    cmdSeal.help = HELP;
    cmdSeal.solve = (ctx, msg, cmdArgs) => {
      try {
        let subCmd = cmdArgs.getArgN(1);
        switch (subCmd) {
          case "吞楼检查": {
            let page = "";
            let tid = -1;
            switch (cmdArgs.args.length) {
              case 1://没有tid，就查询tid，page=e
                tid = queryTid(ext, msg.sender.userId);
                page = "e";
                if (tid === -1) {
                  seal.replyToSender(ctx, msg, `<${msg.sender.nickname}>既没有输入tid，也没有存储tid，找不到帖子哦`);
                  return seal.ext.newCmdExecuteResult(false);
                }
                break;
              case 2://只有页数
                tid = queryTid(ext, msg.sender.userId);
                page = cmdArgs.getArgN(2);
                if (tid === -1) {
                  seal.replyToSender(ctx, msg, `<${msg.sender.nickname}>既没有输入tid，也没有存储tid，找不到帖子哦`);
                  return seal.ext.newCmdExecuteResult(false);
                }
                break;
              case 3:
                page = cmdArgs.getArgN(2);
                tid = Number(cmdArgs.getArgN(3));
                break;
              default:
                seal.replyToSender(ctx, msg, `缺少页数和帖子tid`);
                return seal.ext.newCmdExecuteResult(false);
            }
            const url = `https://${DOMAIN_NAME}/read.php?tid=${tid}&page=${page}`;
            const queryUrl = `${url}&__output=11`;
            seal.replyToSender(ctx, msg, `正在访问${url}，检查其${page === "e" ? "最新" : "第" + page}页的吞楼情况，请稍候`);
            fetch(queryUrl, PARA).then((response) => {
              try {
                if (!response.ok) {
                  seal.replyToSender(ctx, msg, `访问失败，响应状态码为：${response.status}`);
                  return seal.ext.newCmdExecuteResult(false);
                }
                response.json().then((data) => {
                  data = data["data"];
                  const page_rows = data["__R__ROWS_PAGE"];//一页本来应该拥有的楼层数，一般是20
                  const total_rows = data["__R__ROWS"];//这一页实际显示出来的楼层数
                  const missingList = [];
                  const replies = data["__R"];
                  const curPage = Math.floor(Number(replies[0]["lou"]) / page_rows) + 1;
                  if (total_rows !== page_rows) {
                    const startLevel = (Number(curPage) - 1) * 20;
                    const endLevel = startLevel + page_rows;
                    let level = startLevel;
                    for (let reply of replies) {
                      let curLevel = reply["lou"];
                      while (curLevel != level && level < endLevel) {
                        missingList.push(level);
                        ++level;
                      }
                      ++level;
                    }
                  }
                  seal.replyToSender(ctx, msg, `[CQ:at,qq=${msg.sender.userId.replace("QQ:", "")}]
链接：${url}
页数：${curPage}
被吞${missingList.length}层：${missingList.join(",")}`);
                  return seal.ext.newCmdExecuteResult(true);
                });
                return seal.ext.newCmdExecuteResult(true);
              } catch (error) {
                seal.replyToSender(ctx, msg, error.message);
                return seal.ext.newCmdExecuteResult(false);
              }
            });
            return seal.ext.newCmdExecuteResult(true);
          }
          case "记录": {
            const data = JSON.parse(ext.storageGet(STORAGE_KEY) || "{}");
            const tid = Number(cmdArgs.getArgN(2));
            const qq = msg.sender.userId;
            if (data[qq] === void 0) {
              data[qq] = [];
            }
            //之所以定义为列表只是为了方便以后扩展，目前还是每人一个存档位
            if (data[qq].length > 0) {
              data[qq].splice(0, data[qq].length);
            }
            data[qq].push(tid);
            ext.storageSet(STORAGE_KEY, JSON.stringify(data));
            seal.replyToSender(ctx, msg, `已为<${msg.sender.nickname}>记录帖子tid，完整链接为：https://${DOMAIN_NAME}/read.php?tid=${tid}`);
            return seal.ext.newCmdExecuteResult(true);
          }
          case "我的帖子": {
            let tid = queryTid(ext, msg.sender.userId);
            if (tid === -1) {
              seal.replyToSender(ctx, msg, `<${msg.sender.nickname}>还没有记录任何帖子的tid`);
            } else {
              seal.replyToSender(ctx, msg, `<${msg.sender.nickname}>的安科帖：https://${DOMAIN_NAME}/read.php?tid=${tid}`);
            }
            return seal.ext.newCmdExecuteResult(true);
          }
          case "停留时间": {
            let page = 1;
            if (cmdArgs.args.length >= 2) {
              page = Number(cmdArgs.getArgN(2));
            }
            seal.replyToSender(ctx, msg, `正在查询，请稍候`);
            fetch(`https://${DOMAIN_NAME}/thread.php?fid=784&page=${page}&__output=11`, PARA).then((response) => {
              if (!response.ok) {
                seal.replyToSender(ctx, msg, `访问失败，响应状态码为：${response.status}`);
                return seal.ext.newCmdExecuteResult(false);
              }
              response.json().then((data) => {
                data = data["data"];
                try {
                  const threads = data["__T"];
                  let detentionTime = -1;
                  for (let i = threads.length - 1; i >= 0; --i) {
                    const thread = threads[i];
                    if (thread["recommend"] > 0) {
                      continue;//如果加精华了，就跳过，因为这不是准确的首页停留时间
                    }
                    let now = /* @__PURE__ */ new Date();
                    let lastpost = new Date(Number(thread["lastpost"]));
                    let time = now.getTime() - lastpost.getTime() * 1e3;
                    detentionTime = Math.floor(time / (60 * 1e3));
                    break;
                  }
                  if (detentionTime === -1) {
                    seal.replyToSender(ctx, msg, `出错了，没能计算出来`);
                    return seal.ext.newCmdExecuteResult(false);
                  } else {
                    seal.replyToSender(ctx, msg, `刚更新的安科帖可以在前${page}页停留${detentionTime}分钟`);
                    return seal.ext.newCmdExecuteResult(true);
                  }
                } catch (error) {
                  seal.replyToSender(ctx, msg, error.message);
                  return seal.ext.newCmdExecuteResult(false);
                }
              });
              return seal.ext.newCmdExecuteResult(true);
            });
            return seal.ext.newCmdExecuteResult(true);
          }
          case "help":
          default: {
            const ret = seal.ext.newCmdExecuteResult(true);
            ret.showHelp = true;
            return ret;
          }
        }
      } catch (error) {
        seal.replyToSender(ctx, msg, error.message);
        return seal.ext.newCmdExecuteResult(false);
      }
    };
    ext.cmdMap["安科"] = cmdSeal;
    ext.cmdMap["anko"] = cmdSeal;
  }
  main();
})();
