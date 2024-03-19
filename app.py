from flask import Flask, request, render_template, abort, jsonify, send_file
from models import Template, Image
import os
import tempfile


app = Flask(__name__)

@app.route('/template/<int:template_id>')
def upload(template_id):
  return render_template('upload_file_example.html', template_id=template_id)

@app.route('/pattern/edit')
def edit():
  return render_template('edit_pattern.html')


@app.route('/')
def hello():
  return render_template('index.html')




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


# AAAAAAAAAAAAAAAAAAAAAAPPPPPPPPPPPPPPPPPPPPPPPPPPIIIIIIIIIIIIIIIIIIIIIII

@app.route('/api/template/<int:template_id>/upload', methods=['POST'])
def upload_file(template_id):
    """Апи на загрузку изображения на сервер"""

    # Проверка наличия файла в запросе
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    # Проверка наличия имени файла
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Чтение содержимого файла
    content = file.read()

    template_id = request.form.get('template_id')

    # Сохранение файла в базу данных
    image = Image.create(template_id=template_id, content=content)

    return jsonify({'message': 'File uploaded successfully', 'image': image.id}), 200

@app.route('/api/image/<int:image_id>', methods=['GET'])
def get_image(image_id):
  """Отправляет пользователю изображение"""
  try:
      image = Image.get_by_id(image_id)
      with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        temp_file.write(image.content)
        # Отправляем временный файл в качестве ответа
      return send_file(temp_file.name, mimetype='image/png', as_attachment=False)
  except Image.DoesNotExist:
      return jsonify({'error': 'Image not found'}), 404

if __name__ == '__main__':
  app.run(debug=True)
