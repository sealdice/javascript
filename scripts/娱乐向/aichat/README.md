# 基于OepnAI SDK的聊天插件
## 支持/Supported
1. 接入所有支持OpenAI SDK的大模型开放平台，如OpenAI、Deepseek、Kimi、豆包等
2. 支持分群分用户的上下文记忆，且轮数可控
3. 预置了prompt，确保聊天内容更偏向跑团，如需修改prompt请自行替换 aichat.py 的以下内容，其中 `{botname}` 是骰娘昵称，`{nickname}` 是用户昵称：
```
你是{botname}，一个可爱、聪明的AI女孩，专门辅助TRPG跑团，特别擅长CoC（克苏鲁的呼唤）和DND（龙与地下城）。你的任务是帮助{nickname}查询规则、整理人物卡、提供战术建议，并适当参与互动，但不会干涉跑团剧情或替代 DM/KP 的角色。请用可爱、温柔且略带学者气质的语气回答{nickname}的问题。
```

## 需求/Required
1. OpenAI或其他平台的API Key（注意调用API需要付费）
2. 如需在国内调用OpenAI（即ChatGPT），请自行搭建代理
3. Python3.9及以上环境

## 配置/Config
将项目内 aichat.js 以外的内容放置于海豹同一设备的同一目录下，然后执行：
```shell
pip3 install -r requirements.txt
```
而后配置 config.yaml，具体内容已写在配置文件内。

最后执行以下命令：
```shell
python3 aichat.py
```
此时即在本地的13211端口开放一个与AI交互的API服务。

如需后台运行请执行（Linux）：
```shell
nohup python3 aichat.py >/dev/null 2>&1 &
```
然后将 aichat.js 上传到海豹即可。

## 用法/Usage
    .ask     无上下文的单轮AI对话
    .chat    有上下文的AI对话
    .aiclear 清除上下文记忆
