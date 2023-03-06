from flask import Flask, request
from revChatGPT.V1 import Chatbot
import json

app = Flask(__name__)
chatbot = Chatbot(config={
    "email": "email",
    "password": "your password"

    # or "session_token": "..."
    # cookies on chat.openai.com as "__Secure-next-auth.session-token"

    # or "access_token": "<access_token>"
    # https://chat.openai.com/api/auth/session
}
)
conversation = chatbot.get_conversations()[0]['id']


def getchatgpt(data, chatbot, conversation):
    full_text = ""
    for line in chatbot.ask(data, conversation_id=conversation):
        full_text = line["message"]
    return full_text


@app.route('/', methods=['POST'])
def chat():
    global chatbot, conversation
    while 1:
        text = request.json["text"]
        try:
            if text == "#reset":
                chatbot.reset_chat()
                chatbot.clear_conversations()
                conversation = chatbot.get_conversations()[0]['id']
                return "Chat session successfully reset."
            else:
                return getchatgpt(text, chatbot, conversation)
        except:
            chatbot = Chatbot(config={
                "email": "email",
                "password": "your password"

                # or "session_token": "..."
                # cookies on chat.openai.com as "__Secure-next-auth.session-token"

                # or "access_token": "<access_token>"
                # https://chat.openai.com/api/auth/session
            }
            )


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5418, debug=False)
