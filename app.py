from flask import Flask, request, render_template, abort, jsonify, send_file
from models import Template, Image
import os
import tempfile
import json


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



def generate_image(template: Template):

  if not template.json:
    return

  path = os.path.join('projects', f'{template.id}')
  if not os.path.exists(path):
    os.mkdir(path)


  params: dict = json.loads(template.json)
  cmd = f'convert -size {params["width"].replace("px","")}x{params["height"].replace("px","")} xc:none '

  for img in params['images']:
    image: Image = Image.get_by_id(img['id'])
    
    img_name = f'{image.id}.png'
    with open(os.path.join(path, img_name), 'bw') as f:
      f.write(image.content)

    cmd += '-draw "image over '

    if "margin-left" in img and "margin-top" in img:
      cmd += f'{img["margin-left"].replace("px","")},{img["margin-top"].replace("px","")} '

    if "width" in img and "height" in img:
      cmd += f'{img["width"].replace("px","")},{img["height"].replace("px","")} '

    cmd += f'\'{os.path.join(os.getcwd(), path, img_name)}\'" '


  cmd += 'result.png'
  template.imagemagick = cmd
  template.save()

  print(cmd)



    
generate_image(Template.get_by_id(1))

# generate_image(Template.get_or_create()[0])

# AAAAAAAAAAAAAAAAAAAAAAPPPPPPPPPPPPPPPPPPPPPPPPPPIIIIIIIIIIIIIIIIIIIIIII

@app.route('/api/template', methods=['POST'])
def generate_template():
  """Создает шаблон"""
  template = Template.create()
  return jsonify({'template_id':template.id}), 200


@app.route('/api/template/<int:template_id>', methods=['GET', 'PATCH'])
def get_template(template_id):
  """Пролучить и обновить шаблон"""
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
        return jsonify({'error': 'Файл в запросе не найден'}), 400

    file = request.files['file']

    # Проверка наличия имени файла
    if file.filename == '':
        return jsonify({'error': 'Имя файла не найдено'}), 400

    # Чтение содержимого файла
    content = file.read()

    template_id = request.form.get('template_id')

    # Сохранение файла в базу данных
    image = Image.create(template_id=template_id, content=content)

    return jsonify({'message': 'Всё прекрасно. Файл загружен.', 'image': image.id}), 200


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
