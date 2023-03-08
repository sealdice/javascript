if (!seal.ext.find("chatgpt")) {
  const ext = seal.ext.new("chatgpt","fairyowo","1.0.0");
  const cmdchatgpt = seal.ext.newCmdItemInfo();
  cmdchatgpt.name = "chatgpt";
  cmdchatgpt.help ="聊天";
  cmdchatgpt.solve = (ctx, msg, cmdArgs) => {
    let val = cmdArgs.getArgN(1);
    switch (val) {
      case "help": {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
      }
      default: {
        if (!val) {
          seal.replyToSender(ctx, msg, "请输入内容");
          return;
        }
        let text = val;
        let pram={
	method:"POST",
	body: JSON.stringify({"text":text}),
	headers:{
		"Content-Type":"application/json",
		'Accept': 'application/json'
	}
               }
        let url =
          "http://127.0.0.1:5418/"
        // 发送 post 请求
        fetch(url,pram)
          .then((response) => {
            if (response.ok) {
              return response.text();
            } else {
              console.log(response.status);
              console.log("api失效！");
              seal.replyToSender(ctx, msg, "api失效！");
            }
          })
          .then((data) => {
            seal.replyToSender(ctx, msg, data);
          })
          .catch((error) => {
            console.log("error")
          });
        return seal.ext.newCmdExecuteResult(true);
      }
    }
  };
  // 注册命令
  ext.cmdMap["chat"] = cmdchatgpt;
  // 注册扩展
  seal.ext.register(ext);
}