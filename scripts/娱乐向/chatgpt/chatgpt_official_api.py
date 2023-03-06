from revChatGPT.V3 import Chatbot
from flask import Flask, request
import requests
import json

api_key = 'your_api'
chatbot = Chatbot(api_key=api_key, proxy='your_proxy')

app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
def chat():
    global chatbot
    if request.method == 'POST':
        text = request.json["text"]
    else:
        text = request.args.get('text')
    while 1:
        try:
            return chatbot.ask(text)
        except:
            pass


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5418, debug=False)
