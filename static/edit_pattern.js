let canvas;
let ctx;
let hostname;
let port;
let parts;
let template_id;
let canvas_data;
let selectedIndex = -1; // Индекс выбранного
let dragStartX, dragStartY; // Начальные координаты перетаскивания

// после загрузки окна
window.onload = function(){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    hostname = window.location.hostname;
    port = window.location.port;
    parts = window.location.href.split('/')
    template_id = parts[parts.length - 1];
    // Массив для хранения текстов
    canvas_data = {
        id: template_id,
        width: canvas.width,
        height: canvas.height,
        color: "#ffffff",
        entities: []
    };
    
    document.getElementById('canvas-width').value = canvas.width;
    document.getElementById('canvas-height').value = canvas.height;
    
    // при изменении ширины хослта
    document.getElementById('canvas-width').addEventListener('input', () => {
        canvas_data.width = parseInt(document.getElementById('canvas-width').value);
        drawObjects();
    });
    
    // при изменении высоты хоста
    document.getElementById('canvas-height').addEventListener('input', () => {
        canvas_data.height = parseInt(document.getElementById('canvas-height').value);
        drawObjects();
    });
    
    // при измененении цвета фона хоста
    document.getElementById('canvas-color').addEventListener('input', () => {
        canvas_data.color = document.getElementById('canvas-color').value;
        drawObjects();
    });

    // при клике на холст
    canvas.addEventListener('click', (event) => {
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;
        selectedIndex = canvas_data.entities.findIndex(obj => {
            const textWidth = ctx.measureText(obj.text).width;
            return mouseX >= obj.x && mouseX <= obj.x + textWidth && mouseY >= obj.y - obj.fontSize && mouseY <= obj.y;
        });
        drawObjects();
        if (selectedIndex !== -1) {
            document.getElementById('canvas-property-panel').style.display = 'none'
            document.getElementById('text-properties-panel').style.display = 'block'
    
            const selectedText = canvas_data.entities[selectedIndex];
            document.getElementById('text-input').value = selectedText.text;
            document.getElementById('text-x').value = selectedText.x;
            document.getElementById('text-y').value = selectedText.y;
            document.getElementById('font-size').value = selectedText.fontSize;
            document.getElementById('font-weight').value = selectedText.fontWeight;
        }
    });
    
    // при изменении текста текста
    document.getElementById('text-input').addEventListener('input', (event) => {
        if (selectedIndex !== -1) {
            canvas_data.entities[selectedIndex].text = event.target.value;
            drawObjects();
        }
    });
    
    // при изменении горизонтальной координаты текста
    document.getElementById('text-x').addEventListener('input', (event) => {
        if (selectedIndex !== -1) {
            console.log(event.target.value, selectedIndex, canvas_data);
            const newX = parseFloat(event.target.value);
            if (!isNaN(newX)) {
                canvas_data.entities[selectedIndex].x = newX;
                drawObjects();
            }
        }
    });
    
    // при изменении вертикальной координаты текста
    document.getElementById('text-y').addEventListener('input', (event) => {
        if (selectedIndex !== -1) {
            const newY = parseFloat(event.target.value);
            if (!isNaN(newY)) {
                canvas_data.entities[selectedIndex].y = newY;
                drawObjects();
            }
        }
    });
    
    // при изменении размера текста
    document.getElementById('font-size').addEventListener('input', (event) => {
        if (selectedIndex !== -1) {
            const newFontSize = parseInt(event.target.value);
            if (!isNaN(newFontSize)) {
                canvas_data.entities[selectedIndex].fontSize = newFontSize;
                drawObjects();
            }
        }
    });
    
    // при изменении жирности текста
    document.getElementById('font-weight').addEventListener('change', (event) => {
        if (selectedIndex !== -1) {
            canvas_data.entities[selectedIndex].fontWeight = event.target.value;
            drawObjects();
        }
    });
    
    // при опускании ЛКМ на холсте
    canvas.addEventListener('mousedown', (event) => {
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;
        selectedIndex = canvas_data.entities.findIndex(obj => {
            const textWidth = ctx.measureText(obj.text).width;
            return mouseX >= obj.x && mouseX <= obj.x + textWidth && mouseY >= obj.y - obj.fontSize && mouseY <= obj.y;
        });
        if (selectedIndex !== -1) {
            dragStartX = mouseX;
            dragStartY = mouseY;
            canvas.addEventListener('mousemove', dragText);
            canvas.addEventListener('mouseup', () => {
                canvas.removeEventListener('mousemove', dragText);
            });
        }
    });

    // при клике по кнопке Редактировать холст
    document.getElementById('edit-canvas-btn').addEventListener('click', () => {
        document.getElementById('canvas-property-panel').style.display = 'block'
        document.getElementById('text-properties-panel').style.display = 'none'
    });
    
    // при клике по кнопке добавить текст
    document.getElementById('add-text-btn').addEventListener('click', () => {
        addText(100, 100, 'Новый текст', 24, 'normal');
    });
    
    // приклике по кнопке добавить картинку
    document.getElementById('add-img-btn').addEventListener('click', () => {
        document.getElementById('file-input').click();
    });

    // при выборе изображения
    document.getElementById('file-input').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const image = new Image();
            image.src = URL.createObjectURL(file);
    
            image.onload = function() {
                console.log('Ширина изображения:', this.width);
                console.log('Высота изображения:', this.height);
    
                const width = this.width > canvas.width ? canvas.width : this.width;
                const height = this.height > canvas.height ? canvas.height : this.height;

                const formData = new FormData();
                formData.append('image', file);
    
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/image', true);
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    
                xhr.onload = function() {
                    const jsonResponse = JSON.parse(xhr.responseText);
                    if (xhr.status === 200) {
                        console.log('Изображение успешно загружено на сервер');
                        addImg(0,0,`api/image/${jsonResponse.image}`,width,height)
                    } else {
                        console.error('Произошла ошибка при загрузке изображения:', xhr.status, jsonResponse);
                    }
                };
    
                xhr.onerror = function() {
                    console.error('Произошла ошибка при отправке запроса');
                };
    
                xhr.send(formData);
            };
        }
    });

    // при клике по кнопке сохранить
    document.getElementById('save-btn').addEventListener('click', () => {
        const xhr = new XMLHttpRequest();
        xhr.open("PATCH", `http://${hostname}:${port}/api/template/${template_id}`);
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhr.onload = () => {
            if (xhr.status == 200) {
                const json_response = JSON.parse(xhr.responseText);
                // window.location.href = `http://${hostname}:${port}/template/${template_id}`;
            } else {
                console.log(`Error: ${xhr.status}`);
            }
        };
        xhr.send(JSON.stringify(canvas_data));
    });
    
    fetchData(`http://${hostname}:${port}/api/template/${template_id}`, loadTemplate)
}



// Пример списка объектов
/*
{  
    "width": "200",
    "height": "200",
    "color": "#ffffff"
    "entities": [
        {
            "type":"image",
            "url": "/api/image/1",
            "width": 100,
            "height": 100,
            "x": 0,
            "y": 0
        },
        {
            "type":"text",
            "text": "wello world",
            "fontSize": 2,
            "x": 0,
            "y": 0p
        }
    ]
}
 
*/


function fetchData(url, callback) {
    fetch(url)
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => console.error('Ошибка загрузки данных:', error));
}

function drawObjects() {
    document.getElementById('canvas-width').value = canvas_data.width;
    canvas.width = canvas_data.width;

    document.getElementById('canvas-height').value = canvas_data.height;
    canvas.height = canvas_data.height;

    document.getElementById("fieldId").style.margin = "50px 100px" //"calc((100lvh - " + canvas_data.height + ")/2)";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('canvas-color').value = canvas_data.color;
    canvas.style.backgroundColor = document.getElementById('canvas-color').value;

    canvas_data.entities.forEach((entity, index) => {
        switch (entity.type) {
            case 'text':
                ctx.fillStyle = '#dadada';
                ctx.font = `${entity.fontWeight} ${entity.fontSize}px Arial`;
                ctx.fillText(entity.text, entity.x, entity.y);
                if (index === selectedIndex) {
                    ctx.strokeStyle = 'blue';
                    ctx.strokeRect(entity.x - 5, entity.y - entity.fontSize, ctx.measureText(entity.text).width + 10, entity.fontSize + 5);
                }
                break;
            case 'image':
                const image = new Image();
                image.onload = function(){
                    ctx.drawImage(image, entity.x, entity.y, entity.width, entity.height);
                }
                console.log(`http://${hostname}:${port}/${entity.url}`)
                image.src = `http://${hostname}:${port}/${entity.url}`;
                break;
        }
    });
}

function loadTemplate(jsonData) {
    canvas_data = jsonData;
    drawObjects();
}

function addText(x, y, text, fontSize, fontWeight) {
    const textObj = {
        type: 'text',
        text: text,
        fontSize: fontSize,
        fontWeight: fontWeight,
        x: x,
        y: y
    };
    canvas_data.entities.push(textObj);
    drawObjects();
}

function addImg(x, y, imgUrl, width, height){
    const imgObj = {
        type:"image",
        url: imgUrl,
        width: width,
        height: height,
        x: x,
        y: y
    };
    canvas_data.entities.push(imgObj);
    drawObjects();
}


function dragText(event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;
    const deltaX = mouseX - dragStartX;
    const deltaY = mouseY - dragStartY;
    canvas_data.entities[selectedIndex].x += deltaX;
    canvas_data.entities[selectedIndex].y += deltaY;
    dragStartX = mouseX;
    dragStartY = mouseY;
    drawObjects();
}
