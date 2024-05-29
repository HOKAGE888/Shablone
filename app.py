from flask import Flask, request, render_template, abort, jsonify, send_file
from models import Brand, ProductSubtype, ProductType, Template, Image, MetalType, Product
import os
import zipfile
import subprocess
import requests
import shutil
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



def generate_cmd_by_image(entity: dict):

  if entity['type'] == 'image':
    try:
      img_name = os.path.join('images', f'{int(entity["id"])}.png')
    except:
      img_name = os.path.join('image', str(entity["id"]))
  elif entity['type'] == 'product':
    img_name = os.path.join('products', f'{int(entity["id"])}.png')

  img_name = os.path.join(os.getcwd(), img_name).replace("\\", "\\\\")

  cmd = f'( "{img_name}" -resize {entity["width"]}x{entity["height"]} -geometry +{entity["x"]}+{entity["y"]} ) '
  # cmd += '-draw "image over '

  # cmd += f'{entity["x"]},{entity["y"]} '
  # cmd += f'{entity["width"]},{entity["height"]} '
  # cmd += f"'mpr:shadow{entity['x']}{entity['y']}'\" ) -write mpr:shadow{entity['x']}{entity['y']} ) +swap -background none -layers merge +repage "
  # p = os.path.join(os.getcwd(), img_name).replace("\\", "\\\\")
  # cmd += f'\'{p}\'" '

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
    
    if entity['type'] in ['image', 'product']:
      cmd += generate_cmd_by_image(entity)
    elif entity['type'] == 'text':
      cmd += generate_cmd_by_text(entity)


  
  cmd += "-layers merge +repage "
  cmd += '"' + os.path.join(os.getcwd(), path, "result.png").replace("\\", "\\\\") + '"'
  print(f"\033[96m{cmd}\033[0m")
  subprocess.check_output(cmd)
  return cmd



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

def zip_folder(folder_path, zip_path):
    # Создаем объект zip файла
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Проходим по всем директориям и файлам в указанной папке
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                # Получаем полный путь к файлу
                file_path = os.path.join(root, file)
                # Получаем относительный путь файла к архивируемой папке
                arcname = os.path.relpath(file_path, start=folder_path)
                # Добавляем файл в архив
                zipf.write(file_path, arcname)

def move_file(src_file, dest_dir):
    # Проверяем, существует ли исходный файл
    if not os.path.isfile(src_file):
        print(f'Исходный файл не существует: {src_file}')
        return

    # Проверяем, существует ли каталог назначения
    if not os.path.isdir(dest_dir):
        print(f'Каталог назначения не существует: {dest_dir}')
        return

    # Получаем имя файла из пути исходного файла
    file_name = os.path.basename(src_file)

    # Полный путь к новому файлу в каталоге назначения
    dest_file = os.path.join(dest_dir, file_name)

    try:
        # Перемещаем файл
        shutil.move(src_file, dest_file)
    except Exception as e:
        print(f'Ошибка при перемещении файла: {e}')

def get_product_from_entities(entities: list):
  for entity in entities:
    if entity['type'] == 'image' and entity['id'] == 'product.png':
      return entity

def rename_file(src_file, new_name):
    # Проверяем, существует ли исходный файл
    if not os.path.isfile(src_file):
        print(f'Исходный файл не существует: {src_file}')
        return

    # Получаем директорию исходного файла
    dir_name = os.path.dirname(src_file)

    # Полный путь к новому файлу
    new_file_path = os.path.join(dir_name, new_name)

    try:
        # Переименовываем файл
        os.rename(src_file, new_file_path)
    except Exception as e:
        print(f'Ошибка при переименовании файла: {e}')

@app.route('/api/template/<int:template_id>/zip/', methods=['GET'])
def get_template_zip(template_id):
  template = Template.get_by_id(template_id)
  products = Product.filter(
    product_subtype=template.product_subtype,
    brand=template.brand,
    metal_type=template.metal_type
  )

  params: dict = json.loads(template.json)
  entity = get_product_from_entities(params['entities'])
  entity['type'] = 'product'
  project_path = os.path.join(os.getcwd(), 'projects', f'{template.id}')
  
  for product in products:
    response = requests.get(product.url)
    if response.status_code != 200:
      return jsonify({'error': f'Не удалось скачать {product.url}'}), 404
    
    image_path = os.path.join(os.getcwd(), 'products', f'{product.id}.png')
    with open(image_path, 'wb') as file:
      file.write(response.content)
    
    entity['id'] = product.id
    template.json = str(params).replace("'",'"')

    generate_template(template)
    rename_file(
      os.path.join(project_path, 'result.png'),
      os.path.join(project_path, f'{product.id}.png'),
    )
  
  zip_file_path = os.path.join(os.getcwd(), 'projects', f'{template.id}.zip')
  zip_folder(project_path, zip_file_path)   
  
  return send_file(
    path_or_file=zip_file_path,
    download_name='archive.zip',
    as_attachment=True
  )


@app.route('/api/template/<int:template_id>/image/', methods=['GET'])
def get_template_image(template_id):
  
  template = Template.get_or_none(id=template_id)
  if template is None:
    return jsonify({'error': 'Шаблон не найден'}), 400

  if template.imagemagick is None:
    cmd = generate_template(template)
    template.imagemagick = cmd
    template.save()

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


@app.route('/api/image/<string:image_name>/', methods=['GET'])
def get_image_by_name(image_name):
  """Отправляет пользователю изображение"""
  
  return send_file(os.path.join('image',  image_name), mimetype='image/png', as_attachment=False)


@app.route('/api/image/<int:image_id>/', methods=['GET'])
def get_image_by_id(image_id):
  """Отправляет пользователю изображение"""
  
  image = Image.get_or_none(id=image_id)
  if image is None:
    return jsonify({'error': 'Image not found'}), 404
  
  # Отправляем временный файл в качестве ответа
  return send_file(os.path.join('images',  f'{image.id}.png'), mimetype='image/png', as_attachment=False)


if __name__ == '__main__':
  for path in ['images', 'projects', 'products']:
      if not os.path.exists(path):
        os.mkdir(path)
  

  app.run(debug=True)
