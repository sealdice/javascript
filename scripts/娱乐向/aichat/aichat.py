import base64
import httpx
import asyncio
import yaml

from flask import Flask, request, jsonify
from openai import AsyncOpenAI

app = Flask(__name__)

class Config():
    def __init__(self, config_path: str):
        with open(config_path, 'r', encoding='utf-8') as file:
            config = yaml.safe_load(file)
            self.oneapi_key = config.get('oneapi_key')
            self.oneapi_url = config.get('oneapi_url', None)
            self.oneapi_model = config.get('oneapi_model', None)
            self.max_tokens = config.get('max_tokens', 150)
            self.max_ctx = config.get('max_ctx', 15)
            self.timeout = config.get('timeout', 60)

plugin_config = Config('config.yaml')

if plugin_config.oneapi_url:
    client = AsyncOpenAI(api_key=plugin_config.oneapi_key, base_url=plugin_config.oneapi_url)
else:
    client = AsyncOpenAI(api_key=plugin_config.oneapi_key)

model_id = plugin_config.oneapi_model
max_tokens = plugin_config.max_tokens
max_ctx = plugin_config.max_ctx
timeout = plugin_config.timeout

session = {}

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_id = data.get('user_id', None)
    group_id = data.get('group_id', None)
    bot_id = data.get('bot_id', None)
    nickname = data.get('nickname', "用户")
    botname = data.get('botname', "海豹")
    content = data.get('content', None)
    img_url = data.get('img_url', None)

    if not content:
        return jsonify({"code": 400, "message": "内容不能为空！"}), 400
    
    if not user_id:
        return jsonify({"code": 400, "message": "用户ID不能为空！"}), 400
    
    if not bot_id:
        return jsonify({"code": 400, "message": "机器人ID不能为空！"}), 400

    session_id = f"{bot_id}_{group_id}_{user_id}" if group_id else f"{bot_id}_Private_{user_id}"
    if session_id not in session:
        session[session_id] = []
        session[session_id].append({"role": "system", "content": f"你是{botname}，一个可爱、聪明的AI女孩，专门辅助TRPG跑团，特别擅长CoC（克苏鲁的呼唤）和DND（龙与地下城）。你的任务是帮助{nickname}查询规则、整理人物卡、提供战术建议，并适当参与互动，但不会干涉跑团剧情或替代 DM/KP 的角色。请用可爱、温柔且略带学者气质的语气回答{nickname}的问题。"})

    if max_ctx > 0 and len(session[session_id]) >= max_ctx*2+1:
        session[session_id] = session[session_id][3:]
        session[session_id].insert(0, {"role": "system", "content": f"你是{botname}，一个可爱、聪明的AI女孩，专门辅助TRPG跑团，特别擅长CoC（克苏鲁的呼唤）和DND（龙与地下城）。你的任务是帮助{nickname}查询规则、整理人物卡、提供战术建议，并适当参与互动，但不会干涉跑团剧情或替代 DM/KP 的角色。请用可爱、温柔且略带学者气质的语气回答{nickname}的问题。"})

    if not img_url or "moonshot" in model_id or "deepseek" in model_id:
        try:
            session[session_id].append({"role": "user", "content": content})
            async def get_response():
                response = await client.chat.completions.create(
                    model=model_id,
                    messages=session[session_id],
                    max_tokens=max_tokens,
                    temperature=1.0,
                    stream=False,
                    timeout=timeout
                )
                return response
            response = asyncio.run(get_response())
        except Exception as error:
            if "429" in str(error) or "503" in str(error):
                return jsonify({"code": 503, "message": f"抱歉！出错了！{botname}有些处理不过来消息了...请稍后再试~"}), 503
            return jsonify({"code": 500, "message": str(error)}), 500

        session[session_id].append({"role": "assistant", "content": response.choices[0].message.content})
        return jsonify({"code": 200, "message": response.choices[0].message.content}), 200
    else:
        try:
            image_data = base64.b64encode(httpx.get(img_url, timeout=60).content).decode("utf-8")
            session[session_id].append(
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": content},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/png;base64,{image_data}"},
                        },
                    ],
                }
            )
            response = client.chat.completions.create(
                model=model_id,
                messages=session[session_id],
                max_tokens=max_tokens,
                temperature=1.0,
                stream=False,
                timeout=timeout
            )
        except Exception as error:
            if "429" in str(error):
                return jsonify({"code": 503, "message": f"抱歉！出错了！{botname}有些处理不过来消息了...请稍后再试~"}), 503
            return jsonify({"code": 500, "message": str(error)}), 500
        return jsonify({"code": 200, "message": response.choices[0].message.content}), 200

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    nickname = data.get('nickname', "用户")
    botname = data.get('botname', "海豹")
    content = data.get('content', None)
    img_url = data.get('img_url', None)

    if not content:
        return jsonify({"code": 400, "message": "内容不能为空！"}), 400

    if not img_url or "moonshot" in model_id or "deepseek" in model_id:
        try:
            async def get_response():
                response = await client.chat.completions.create(
                    model=model_id,
                    messages=[{"role": "system", "content": f"你是{botname}，一个可爱、聪明的AI女孩，专门辅助TRPG跑团，特别擅长CoC（克苏鲁的呼唤）和DND（龙与地下城）。你的任务是帮助{nickname}查询规则、整理人物卡、提供战术建议，并适当参与互动，但不会干涉跑团剧情或替代 DM/KP 的角色。请用可爱、温柔且略带学者气质的语气回答{nickname}的问题。"}, {"role": "user", "content": content}],
                    max_tokens=max_tokens,
                    temperature=1.0,
                    stream=False,
                    timeout=timeout
                )
                return response
            response = asyncio.run(get_response())
        except Exception as error:
            if "429" in str(error) or "503" in str(error):
                return jsonify({"code": 503, "message": f"抱歉！出错了！{botname}有些处理不过来消息了...请稍后再试~"}), 503
            return jsonify({"code": 500, "message": str(error)}), 500
        return jsonify({"code": 200, "message": response.choices[0].message.content}), 200
    else:
        try:
            image_data = base64.b64encode(httpx.get(img_url, timeout=60).content).decode("utf-8")
            response = client.chat.completions.create(
                model=model_id,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": content},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{image_data}"
                                },
                            },
                        ],
                    }
                ],
                max_tokens=max_tokens,
                temperature=1.0,
                stream=False,
                timeout=timeout
            )
        except Exception as error:
            if "429" in str(error):
                return jsonify({"code": 503, "message": f"抱歉！出错了！{botname}有些处理不过来消息了...请稍后再试~"}), 503
            return jsonify({"code": 500, "message": str(error)}), 500
        return jsonify({"code": 200, "message": response.choices[0].message.content}), 200

@app.route('/aiclear', methods=['POST'])
def aiclear():
    data = request.json
    user_id = data.get('user_id', None)
    group_id = data.get('group_id', None)
    bot_id = data.get('bot_id', None)
    
    if not user_id:
        return jsonify({"code": 400, "message": "用户ID不能为空！"}), 400
    
    if not bot_id:
        return jsonify({"code": 400, "message": "机器人ID不能为空！"}), 400
    
    session_id = f"{bot_id}_{group_id}_{user_id}" if group_id else f"{bot_id}_Private_{user_id}"
    if session_id in session:
        del session[session_id]
    return jsonify({"code": 200, "message": "成功清除历史记录！"}), 200

if __name__ == '__main__':
    from gunicorn.app.wsgiapp import run
    import sys
    sys.argv = ['gunicorn', '-b', '127.0.0.1:13211', '--timeout', str(timeout), 'aichat:app']
    run()
