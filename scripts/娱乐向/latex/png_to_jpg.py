import flask
from PIL import Image, UnidentifiedImageError
import requests
import io
from urllib import parse

app = flask.Flask(__name__)

@app.route('/png_to_jpg/', methods=['POST', 'GET'])
def png_to_jpg():
    if flask.request.method == 'POST': 
        text = flask.request.json['text']
    else:
        text = flask.request.args.get('text')

    image_io = io.BytesIO()
    temp = text.count('\\\\') + 1
    respon = requests.get(f'http://localhost:3000/render?input=latex&inline=0&output=png&height={temp * 128}&source=' + parse.quote(text), stream=True)
    try:
        img = Image.open(respon.raw)
    except UnidentifiedImageError:
        print(text + ' 未识别')
        raise Exception
    img = img.convert('RGBA')
    img2 = Image.new('RGB', size=(img.width, img.height), color=(255, 255, 255))
    img2.paste(img, (0, 0), mask=img)
    img2.save(image_io, 'JPEG', quality=95)
    image_io.seek(0)
    return flask.send_file(image_io, mimetype='image/jpeg')

if __name__ == "__main__":
    app.run(port=3001)

# with open(r'1.png', 'rb') as f:
#     img = Image.open(f)
#     img = img.convert('RGBA')
#     width = img.width
#     height = img.height
#     img2 = Image.new('RGB', size=(width, height), color=(255, 255, 255))
#     img2.paste(img, (0, 0), mask=img)
#     img2.save(r'1.jpg', quality=95)