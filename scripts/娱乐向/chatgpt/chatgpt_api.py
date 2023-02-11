from flask import Flask, request
from revChatGPT.Official import Chatbot
app = Flask(__name__)

chatbot = Chatbot(api_key='your api_key',
                  engine='text-davinci-003')


def getchatgpt(data, temperature=0.5):
    global chatbot
    response = chatbot.ask(data, temperature=temperature)
    return response["choices"][0]["text"]

@app.route('/')
def chat():
    # data = json.load(request.data)['text']
    text = request.args.get('text')
    return getchatgpt(text)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5418, debug=False)