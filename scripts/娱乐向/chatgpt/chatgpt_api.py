from flask import Flask, request
from revChatGPT.V1 import Chatbot
import json

app = Flask(__name__)
chatbot = Chatbot(config={
    'account': 'your_openai_account',
    'password': 'your_openai_password',
    # or "session_token": "..."
    # cookies on chat.openai.com as "__Secure-next-auth.session-token"

    # or "access_token": "<access_token>"
    # https://chat.openai.com/api/auth/session
    'proxy': 'your_proxy',
}
)


def getchatgpt(data, chatbot):
    full_text = ""
    for line in chatbot.ask(data):
        full_text = line["message"]
    return full_text


@app.route('/', methods=['POST'])
def chat():
    global chatbot
    while 1:
        text = request.json["text"]
        try:
            if text == "#reset":
                chatbot.reset_chat()
                return "Chat session successfully reset."
            else:
                return getchatgpt(text, chatbot)
        except:
            chatbot = Chatbot(config={
                'account': 'your_openai_account',
                'password': 'your_openai_password',

                # or "session_token": "..."
                # cookies on chat.openai.com as "__Secure-next-auth.session-token"

                # or "access_token": "<access_token>"
                # https://chat.openai.com/api/auth/session
                'proxy': 'your_proxy',
                'conversation_id ': chatbot.get_conversations[-1]['id']
            }
            )


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5418, debug=False)
