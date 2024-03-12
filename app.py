from flask import Flask, request, render_template, abort
import os


app = Flask(__name__)

@app.route('/pattern/edit')
def edit():
  return render_template('edit_pattern.html')


@app.route('/')
def hello():
  return render_template('index.html')


@app.route('/api/image/', methods=['POST'])
def save_image():
  pass


@app.route('api/template/', methods=['GET'])
def get_templates():
  pass

@app.route('/api/template/', methods=['POST'])
def generate_template():
  if not request.json:
    abort(400)
  
  example_json = {
    'image': 'url изображения, который грузиться сразу после его прикрепления',
    'annotations': ['+0+20 "Hello World"', '+20+40 "Goodbay World"']
  }
  # https://imagemagick.org/script/download.php
  os.system('magick 1.png -annotate +0+20 "Hello World" 2.png')
  
  print('test')
  return {'status':'done'}, 201

if __name__ == '__main__':
  app.run(debug=True)
