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






# AAAAAAAAAAAAAAAAAAAAAAPPPPPPPPPPPPPPPPPPPPPPPPPPIIIIIIIIIIIIIIIIIIIIIII

@app.route('/api/template', methods=['POST'])
def generate_template():
  """Создает шаблон"""
  template = Template.create()
  return jsonify({'template_id':template.id}), 200


@app.route('/api/template/<int:template_id>', methods=['GET', 'PATCH'])
def get_template(template_id):
  
  template = Template.get_or_none(id=template_id)
  if template is None:
    return jsonify({'error': 'Шаблон не найден'}), 400
  
  if request.method == 'PATCH':
    template.json = request.json
  
  return template.json, 200


@app.route('/api/template/<int:template_id>/image', methods=['POST'])
def upload_file(template_id):
    """Загрузить изображения на сервер"""

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
  image = Image.get_or_none(id=image_id)
  if image is None:
    return jsonify({'error': 'Image not found'}), 404
  
  with tempfile.NamedTemporaryFile(delete=False) as temp_file:
    temp_file.write(image.content)
  
  # Отправляем временный файл в качестве ответа
  return send_file(temp_file.name, mimetype='image/png', as_attachment=False)


if __name__ == '__main__':
  app.run(debug=True)
