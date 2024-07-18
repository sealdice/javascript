if (!seal.ext.find('chat-front')) {
    const ext = seal.ext.new('chat-front', 'Halit', '1.0.0');
    seal.ext.register(ext);
  }
  
  let ext = seal.ext.find('chat-front');
  if (!ext) {
    ext = seal.ext.new('chat-front', 'Halit', '1.0.0');
    seal.ext.register(ext);
  }
  
  const cmdChat = seal.ext.newCmdItemInfo();
  cmdChat.name = 'c';
  
  cmdChat.solve = async (ctx, msg, cmdArgs) => {
    const prompt = cmdArgs.getArgN(1);
    if (!prompt) {
      seal.replyToSender(ctx, msg, "今天你想和我聊什么呢");
      return seal.ext.newCmdExecuteResult(true);
    }
  
    const response = await fetch('<填写你的后端api的url>', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: prompt })
    });
    /**
     * 后端api的url例如：http://127.0.0.1:8000/chat/
     * 后端api封装教程：https://www.xfyun.cn/doc/spark/Web.html#%E5%BF%AB%E9%80%9F%E8%B0%83%E7%94%A8%E9%9B%86%E6%88%90%E6%98%9F%E7%81%AB%E8%AE%A4%E7%9F%A5%E5%A4%A7%E6%A8%A1%E5%9E%8B%EF%BC%88python%E7%A4%BA%E4%BE%8B%EF%BC%89
    */
  
    const data = await response.json();
    const text = data.generations[0][0].text;
  
    seal.replyToSender(ctx, msg, text);
    return seal.ext.newCmdExecuteResult(true);
  };
  
  ext.cmdMap['c'] = cmdChat;