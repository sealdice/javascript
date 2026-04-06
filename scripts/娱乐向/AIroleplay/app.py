from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# ===== 请在这里填写你的 API Key 和服务地址 =====
AI_API_KEY = "你的AI API Key"  # 如 DeepSeek、Claude 等
AI_API_URL = "https://api.deepseek.com/chat/completions"  # 默认使用 DeepSeek
AI_MODEL = "deepseek-chat"                                 # 模型名称

# 其他服务商参考：
# DeepSeek（推荐入门）：
#   URL:   https://api.deepseek.com/chat/completions
#   Model: deepseek-chat
#   申请：https://www.deepseek.com
#
# Anthropic Claude（推荐追求质量）：
#   Claude 使用独立 API 格式，需替换 app.py 中的请求部分，详见：
#   https://www.anthropic.com
#   笔者认为效果最佳，但价格较高且大陆地区连接不稳定，物有所值。
#
# OpenAI GPT（兼容格式）：
#   URL:   https://api.openai.com/v1/chat/completions
#   Model: gpt-4o 等
# ================================================

# ===== 隐私说明 =====
# 1. 只有通过指令触发的消息才会发送给 AI，普通聊天内容不会被读取
# 2. 对话记录仅存于内存，服务重启后自动清空，不写入任何文件
# 3. 本项目调用方式不会主动上传数据，但最终取决于你所使用的 AI API 服务商的隐私条款。
#    例如 Anthropic Claude（https://www.anthropic.com）和 DeepSeek（https://www.deepseek.com）
#    均在其条款中说明不将 API 调用数据用于模型训练，使用其他服务商请自行查阅对应条款。
# ====================


# ===== 角色设定，请在这里填写你想扮演的角色 =====

CHAR_NAME = "赫卡特"                          # 角色主名
CHAR_ALIASES = "黑暗女神、十字路口的守护者"      # 别名（没有可留空）
CHAR_ROLE = "魔法与月亮的掌管者，冥界的引路人"   # 身份
CHAR_WORLD = "古希腊神话世界"                  # 世界观背景
CHAR_DESCRIPTION = "古老而强大的存在"          # 对角色的简短描述，如「普通的高中生」「江湖游历的侠客」
CHAR_PERSONALITY = "神秘而深邃，冷静但不冷漠，见过无数灵魂的来去，对世人保持悲悯"  # 性格
CHAR_SPEECH_STYLE = "简短有力，带有预言般的韵味，偶尔用隐喻和暗语说话"  # 语言风格

# 语言格式——已预设，可删改
CHAR_SPEECH_FORMAT = """
- 动作描写用括号表示，仅在推进剧情的关键时刻使用，日常对话不加
- 回复控制在150字以内
"""

# 限制条件——请填写你的角色专属的能与不能
CHAR_RESTRICTIONS = """
- 不称呼对方为「孩子」或任何俗世间长辈对晚辈的称谓
"""

# 人物关系——每行一个，格式：人物名：关系描述，没有可留空
CHAR_RELATIONSHIPS = """
宙斯：诸神之王，我与他井水不犯河水。
珀耳塞福涅：冥界的王后，我为她点燃火炬。
赫敏斯：信使之神，十字路口我们时常相遇。
"""

# ================================================


SYSTEM_PROMPT = f"""你是{CHAR_NAME}，亦名{CHAR_ALIASES}，{CHAR_ROLE}。

你存在于{CHAR_WORLD}中，是一个{CHAR_DESCRIPTION}。

【性格】
{CHAR_PERSONALITY}。

【语言风格】
{CHAR_SPEECH_STYLE}。

【语言格式】
{CHAR_SPEECH_FORMAT}

【限制条件】
{CHAR_RESTRICTIONS}

【人物关系】
{CHAR_RELATIONSHIPS}
"""


# ===== 记忆系统 =====
# 当前版本支持短期上下文记忆，即每位玩家在同一次会话中，角色会记住对话内容。
# 重启服务后记忆清空。
# 如需持久化记忆（跨会话记忆、人物关系记忆），可扩展此处逻辑，
# 例如将 conversation_history 存入本地文件或数据库。
conversation_history = {}


@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    player_name = data.get('playerName', '访客')

    if player_name not in conversation_history:
        conversation_history[player_name] = []

    conversation_history[player_name].append({'role': 'user', 'content': user_message})

    messages = [{'role': 'system', 'content': SYSTEM_PROMPT}] + conversation_history[player_name]

    response = requests.post(
        AI_API_URL,
        headers={
            'Authorization': f'Bearer {AI_API_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'model': AI_MODEL,
            'messages': messages,
            'max_tokens': 300
        }
    )
    result = response.json()
    reply = result['choices'][0]['message']['content']

    conversation_history[player_name].append({'role': 'assistant', 'content': reply})

    return jsonify({'reply': reply})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
