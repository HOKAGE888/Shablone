from flask import Flask, request, render_template, abort, jsonify, send_file
from models import Brand, ProductSubtype, ProductType, Template, Image, MetalType
import os
import subprocess
import tempfile
from flask import json

json.provider.DefaultJSONProvider.ensure_ascii = False
app = Flask(__name__)


@app.route('/template/<int:template_id>/')
def upload(template_id):
  return render_template('edit_pattern.html', template_id=template_id)

@app.route('/edit/')
def edit():
  # return render_template('canvas.html')
  return render_template('index_copy.html')


@app.route('/')
def hello():
  return render_template('index.html')



def generate_cmd_by_image(entity: dict, path):
  img_name = os.path.join('images', f'{entity["id"]}.png')

  cmd = '-draw "image over '

  cmd += f'{entity["x"]},{entity["y"]} '

  cmd += f'{entity["width"]},{entity["height"]} '

  p = os.path.join(os.getcwd(), img_name).replace("\\", "\\\\")
  cmd += f'\'{p}\'" '

  return cmd

def generate_cmd_by_text(entity: dict):
    return f'-font {entity["font"]} -pointsize {entity["fontSize"]} -fill "{entity["color"]}" -annotate +{entity["x"]}+{entity["y"]} "{entity["text"]}" '


def generate_template(template: Template):

  if not template.json:
    return

  path = os.path.join('projects', f'{template.id}')
  if not os.path.exists(path):
    os.mkdir(path)


  params: dict = json.loads(template.json)
  cmd = f'magick -size {params["width"]}x{params["height"]} xc:{params["color"]} '

  for entity in params['entities']:
    
    if entity['type'] == 'image':
      cmd += generate_cmd_by_image(entity, path)
    elif entity['type'] == 'text':
      cmd += generate_cmd_by_text(entity)


  

  cmd += os.path.join(os.getcwd(), path, 'result.png').replace("\\", "\\\\")
  print(subprocess.check_output(cmd))
  template.imagemagick = cmd
  template.save()


@app.route('/move/')
def get_move():
  return render_template('move_text_in_canvas.html')


@app.route('/create/')
def get_create_temlate():
  return render_template('create_template.html')

# AAAAAAAAAAAAAAAAAAAAAAPPPPPPPPPPPPPPPPPPPPPPPPPPIIIIIIIIIIIIIIIIIIIIIII




@app.route('/api/productsubtype/', methods=['GET'])
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

@app.route('/api/producttype/', methods=['GET'])
def get_product_types():
  product_types = ProductType.filter()
  result = {'count':product_types.count(), 'entities':[]}
  for item in product_types:
    result['entities'].append({
      'id':item.id,
      'name':item.name
    })
  return jsonify(result)


@app.route('/api/brand/', methods=['GET'])
def get_brands():
  brands = Brand.filter()
  result = {'count':brands.count(), 'entities':[]}
  for item in brands:
    result['entities'].append({
      'id':item.id,
      'name':item.name
    })
  return jsonify(result)

@app.route('/api/metaltype/', methods=['GET'])
def get_metaltypes():
  metal_types = MetalType.filter()
  result = {'count':metal_types.count(), 'entities':[]}
  for item in metal_types:
    result['entities'].append({
      'id':item.id,
      'name':item.name
    })
  return jsonify(result)

@app.route('/api/template/', methods=['GET', 'POST'])
def api_template():
  """Создает шаблон"""
  if request.method == 'POST':
    template = Template.create(**request.json)
    return jsonify({'template_id':template.id}), 200
  
  params = {}
  for key in ['brand_id', 'product_subtype_id', 'metal_type_id']:
    if key in request.args:
      params[key] = request.args[key]
  
  templates = []
  for template in Template.filter(**params):
    templates.append(
      {
        'id': template.id,
        'brand': template.brand_id,
        'metal_type': template.metal_type_id,
        'product_subtype': template.product_subtype_id,
      }
    )
  return jsonify({"count": len(templates), "entities": templates}), 200
  


@app.route('/api/template/<int:template_id>/', methods=['GET', 'PATCH', 'DELETE'])
def get_template(template_id):
  """Пролучить и обновить шаблон"""
  template = Template.get_or_none(id=template_id)
  if template is None:
    return jsonify({'error': 'Шаблон не найден'}), 400
  
  if request.method == 'PATCH':
    for entity in request.json['entities']:
      if entity['type'] == 'image' and 'image' in entity:
        del entity['image']
    template.json = str(request.json).replace("'",'"')
    template.imagemagick = None
    template.save()
  
  if request.method == 'DELETE':
    template.delete_instance()

  return template.json, 200

@app.route('/api/template/<int:template_id>/image/', methods=['GET'])
def get_template_image(template_id):
  
  template = Template.get_or_none(id=template_id)
  if template is None:
    return jsonify({'error': 'Шаблон не найден'}), 400

  if template.imagemagick is None:
    generate_template(template)

  return send_file(
    os.path.join(os.getcwd(), 'projects', f'{template.id}', 'result.png'),
    mimetype='image/png', 
    as_attachment=False
  )


@app.route('/api/image/', methods=['POST'])
def upload_file():
    """Загрузить изображения на сервер"""

    # Проверка наличия файла в запросе
    if 'image' not in request.files:
        return jsonify({'error': 'Файл в запросе не найден'}), 400

    file = request.files['image']

    image = Image.create()
    file.save(os.path.join('images', f'{image.id}.png'))


    return jsonify({'message': 'Всё прекрасно. Файл загружен.', 'image': image.id}), 200


@app.route('/api/image/<int:image_id>/', methods=['GET'])
def get_image(image_id):
  """Отправляет пользователю изображение"""
  image = Image.get_or_none(id=image_id)
  if image is None:
    return jsonify({'error': 'Image not found'}), 404
  
  # Отправляем временный файл в качестве ответа
  return send_file(os.path.join('images',  f'{image.id}.png'), mimetype='image/png', as_attachment=False)


if __name__ == '__main__':
  for path in ['images', 'projects']:
      if not os.path.exists(path):
        os.mkdir(path)
  
  app.run(debug=True)
