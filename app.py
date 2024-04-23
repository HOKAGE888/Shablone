from flask import Flask, request, render_template, abort, jsonify, send_file
from models import Brand, ProductSubtype, ProductType, Template, Image, MetalType
import os
import tempfile
from flask import json

json.provider.DefaultJSONProvider.ensure_ascii = False
app = Flask(__name__)


@app.route('/template/<int:template_id>')
def upload(template_id):
  return render_template('edit_pattern.html', template_id=template_id)

@app.route('/edit')
def edit():
  return render_template('canvas.html')


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
  cmd = f'magick -size {params["width"].replace("px","")}x{params["height"].replace("px","")} xc:none '

  for annotate in params['images']:
    image: Image = Image.get_by_id(annotate['id'])
    
    img_name = f'{image.id}.png'
    with open(os.path.join(path, img_name), 'bw') as f:
      f.write(image.content)

    cmd += '-draw "image over '

    if "margin-left" in annotate and "margin-top" in annotate:
      cmd += f'{annotate["margin-left"].replace("px","")},{annotate["margin-top"].replace("px","")} '

    if "width" in annotate and "height" in annotate:
      cmd += f'{annotate["width"].replace("px","")},{annotate["height"].replace("px","")} '

    p = os.path.join(os.getcwd(), path, img_name).replace("\\", "\\\\")
    cmd += f'\'{p}\'" '


  for annotate in params['annotations']:
    cmd += '-annotate '

    if "width" in annotate and "height" in annotate:
      cmd += f'+{annotate["width"].replace("px","")}+{annotate["height"].replace("px","")} '

    cmd += f'"{annotate["text"]}" '

    # image: Image = Image.get_by_id(annotate['id'])
    
    # img_name = f'{image.id}.png'
    # with open(os.path.join(path, img_name), 'bw') as f:
    #   f.write(image.content)

    # cmd += '-draw "image over '

    # if "margin-left" in annotate and "margin-top" in annotate:
    #   cmd += f'{annotate["margin-left"].replace("px","")},{annotate["margin-top"].replace("px","")} '


    # cmd += f'\'{os.path.join(os.getcwd(), path, img_name)}\'" '

  cmd += 'result.png'
  template.imagemagick = cmd
  template.save()


@app.route('/move')
def get_move():
  return render_template('move_text_in_canvas.html')


@app.route('/create')
def get_create_temlate():
  return render_template('create_template.html')

# AAAAAAAAAAAAAAAAAAAAAAPPPPPPPPPPPPPPPPPPPPPPPPPPIIIIIIIIIIIIIIIIIIIIIII




@app.route('/api/productsubtype', methods=['GET'])
def get_product_subtypes():
  product_subtypes = ProductSubtype.filter()
  result = {'count':product_subtypes.count(), 'entities':[]}
  for item in product_subtypes:
    result['entities'].append({
      'id':item.id,
      'name':item.name,
      'producttype_id':item.product_type.id
    })
  return jsonify(result)

@app.route('/api/producttype', methods=['GET'])
def get_product_types():
  product_types = ProductType.filter()
  result = {'count':product_types.count(), 'entities':[]}
  for item in product_types:
    result['entities'].append({
      'id':item.id,
      'name':item.name
    })
  return jsonify(result)


@app.route('/api/brand', methods=['GET'])
def get_brands():
  brands = Brand.filter()
  result = {'count':brands.count(), 'entities':[]}
  for item in brands:
    result['entities'].append({
      'id':item.id,
      'name':item.name
    })
  return jsonify(result)

@app.route('/api/metaltype', methods=['GET'])
def get_metaltypes():
  metal_types = MetalType.filter()
  result = {'count':metal_types.count(), 'entities':[]}
  for item in metal_types:
    result['entities'].append({
      'id':item.id,
      'name':item.name
    })
  return jsonify(result)

@app.route('/api/template', methods=['POST'])
def create_template():
  """Создает шаблон"""
  print(request.json)
  template = Template.create(**request.json)
  return jsonify({'template_id':template.id}), 200


@app.route('/api/template/<int:template_id>', methods=['GET', 'PATCH'])
def get_template(template_id):
  """Пролучить и обновить шаблон"""
  template = Template.get_or_none(id=template_id)
  if template is None:
    return jsonify({'error': 'Шаблон не найден'}), 400
  
  if request.method == 'PATCH':
    print(request.json)
    for entity in request.json['entities']:
      if entity['type'] == 'image' and 'image' in entity:
        del entity['image']
    template.json = str(request.json).replace("'",'"')
    template.imagemagick = None
    template.save()
  
  print(template.json)
  return template.json, 200

@app.route('/api/template/<int:template_id>/image', methods=['GET'])
def get_template_image(template_id):
  
  template = Template.get_or_none(id=template_id)
  if template is None:
    return jsonify({'error': 'Шаблон не найден'}), 400

  if template.imagemagick is None:
    generate_image(template_id)

  file_path = os.path.join(os.getcwd(), 'projects', f'{template_id}', 'result.png')

  return send_file(file_path, mimetype='image/png', as_attachment=False)


@app.route('/api/image', methods=['POST'])
def upload_file():
    """Загрузить изображения на сервер"""

    print(request.files)

    # Проверка наличия файла в запросе
    if 'image' not in request.files:
        return jsonify({'error': 'Файл в запросе не найден'}), 400

    file = request.files['image']

    # Чтение содержимого файла
    content = file.read()

    # Сохранение файла в базу данных
    image = Image.create(content=content)

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
