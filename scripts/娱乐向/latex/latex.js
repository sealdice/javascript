if (!seal.ext.find("latex")) {
    const ext = seal.ext.new("latex","FairyOwO","1.0.0");
    const cmdlatex = seal.ext.newCmdItemInfo();
    cmdlatex.name = "latex";
    cmdlatex.help ="latex解析";
    cmdlatex.solve = (ctx, msg, cmdArgs) => {
      let val = msg.message;
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
          
          let url = "http://localhost:3001/png_to_jpg/?text=";
          fetch(url+encodeURIComponent(val.split("latex")[1].trim()))
            .then(x => {
              if (x.ok) {
                let text = x.url;
                seal.replyToSender(ctx, msg, '[CQ:image,file=' + text + ',cache=0]');
              }
              else {
                let text = 'latex解析失败或不支持的格式';
                seal.replyToSender(ctx, msg, text);
              }
            })
            .catch(err => {
              let text = 'latex解析失败或不支持的格式';
              console.log(err);
              seal.replyToSender(ctx, msg, text);
            });

          return seal.ext.newCmdExecuteResult(true);
        }
      }
    };
    // 注册命令
    ext.cmdMap["latex"] = cmdlatex;
    // 注册扩展
    seal.ext.register(ext);
  }