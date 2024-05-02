// // Функция для загрузки данных JSON из API
// function fetchData(url, callback) {
//     fetch(url)
//         .then(response => response.json())
//         .then(data => callback(data))
//         .catch(error => console.error('Ошибка загрузки данных:', error));
// }

// // Функция для заполнения выпадающего списка
// function populateDropdown(jsonData) {
//     const dropdown = document.getElementById('brand');
//     // Очистка списка перед добавлением новых элементов
//     dropdown.innerHTML = '';
//     // Добавление элементов из JSON в список
//     jsonData.entities.forEach(entity => {
//         const option = document.createElement('option');
//         option.value = entity.id;
//         option.textContent = entity.name;
//         dropdown.appendChild(option);
//     });
// }

document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("canvas"); // Получаем ссылку на элемент canvas
    const context = canvas.getContext("2d"); // Получаем контекст рисования на canvas
    let selectedElement = null; // Переменная для хранения выбранного элемента (текста или изображения)
    let isDragging = false; // Флаг для определения перетаскивания элемента
    let isResizing = false; // Флаг для определения изменения размера изображения
    let startX, startY, startWidth, startHeight; // Переменные для хранения начальных координат и размеров при перетаскивании или изменении размера

    function drawText(x, y, text, color, font) { // Функция для рисования текста на canvas
        context.fillStyle = color; // Установка цвета текста
        context.font = font; // Установка шрифта текста
        context.fillText(text, x, y); // Рисование текста на указанных координатах
    }

    function drawImage(x, y, image) { // Функция для рисования изображения на canvas
        context.drawImage(image, x, y, image.width, image.height); // Рисование изображения на указанных координатах и с указанными размерами
    }

    function clearCanvas() { // Функция для очистки canvas
        context.clearRect(0, 0, canvas.width, canvas.height); // Очистка всего canvas
    }

    function handleMouseDown(event) { // Обработчик события нажатия кнопки мыши
        const mouseX = event.clientX - canvas.getBoundingClientRect().left; // Получаем координаты X курсора относительно canvas
        const mouseY = event.clientY - canvas.getBoundingClientRect().top; // Получаем координаты Y курсора относительно canvas

        // Проверяем, был ли клик на тексте
        for (const element of elements) {
            if (element.type === 'text' && mouseX > element.x && mouseX < element.x + element.width && mouseY > element.y - 20 && mouseY < element.y) {
                selectedElement = element; // Устанавливаем выбранный элемент
                document.getElementById('textEditor').value = element.text; // Устанавливаем текст редактора в текст элемента
                document.getElementById('font').value = selectedFont; // Устанавливаем выбранный шрифт в селектор шрифтов
                return;
            }
        }

        // Проверяем, был ли клик на углу изображения для изменения размера
        for (const element of elements) {
            if (element.type === 'image' && mouseX > element.x + element.width - 10 && mouseX < element.x + element.width && mouseY > element.y + element.height - 10 && mouseY < element.y + element.height) {
                selectedElement = element; // Устанавливаем выбранный элемент
                isResizing = true; // Устанавливаем флаг изменения размера
                startX = mouseX; // Сохраняем начальную позицию X
                startY = mouseY; // Сохраняем начальную позицию Y
                startWidth = element.width; // Сохраняем начальную ширину
                startHeight = element.height; // Сохраняем начальную высоту
                return;
            }
        }

        // Проверяем, был ли клик на изображении для перетаскивания
        for (const element of elements) {
            if (element.type === 'image' && mouseX > element.x && mouseX < element.x + element.width && mouseY > element.y && mouseY < element.y + element.height) {
                selectedElement = element; // Устанавливаем выбранный элемент
                isDragging = true; // Устанавливаем флаг перетаскивания
                startX = mouseX - element.x; // Вычисляем смещение X относительно начальной позиции элемента
                startY = mouseY - element.y; // Вычисляем смещение Y относительно начальной позиции элемента
                return;
            }
        }
    }

    function handleMouseMove(event) { // Обработчик события движения мыши
        if (isDragging && selectedElement) { // Если происходит перетаскивание и выбран элемент
            const mouseX = event.clientX - canvas.getBoundingClientRect().left; // Получаем текущие координаты X курсора относительно canvas
            const mouseY = event.clientY - canvas.getBoundingClientRect().top; // Получаем текущие координаты Y курсора относительно canvas
            selectedElement.x = mouseX - startX; // Устанавливаем новую позицию X элемента
            selectedElement.y = mouseY - startY; // Устанавливаем новую позицию Y элемента
            redrawCanvas(); // Перерисовываем canvas
        } else if (isResizing && selectedElement) { // Если происходит изменение размера и выбран элемент
            const mouseX = event.clientX - canvas.getBoundingClientRect().left; // Получаем текущие координаты X курсора относительно canvas
            const mouseY = event.clientY - canvas.getBoundingClientRect().top; // Получаем текущие координаты Y курсора относительно canvas
            const width = startWidth + (mouseX - startX) - selectedElement.x; // Вычисляем новую ширину элемента
            const height = startHeight + (mouseY - startY) - selectedElement.y; // Вычисляем новую высоту элемента
            selectedElement.width = Math.max(10, width); // Устанавливаем новую ширину, но не меньше 10
            selectedElement.height = Math.max(10, height); // Устанавливаем новую высоту, но не меньше 10
            redrawCanvas(); // Перерисовываем canvas
        }
    }

    function handleMouseUp(event) { // Обработчик события отпускания кнопки мыши
        isDragging = false; // Сбрасываем флаг перетаскивания
        isResizing = false; // Сбрасываем флаг изменения размера
    }

    function redrawCanvas() { // Функция для перерисовки canvas
        clearCanvas(); // Очищаем canvas
        elements.forEach(element => { // Перебираем все элементы на canvas
            if (element.type === 'text') { // Если элемент текст
                drawText(element.x, element.y, element.text, element.color, element.font); // Рисуем текст
            } else if (element.type === 'image') { // Если элемент изображение
                drawImage(element.x, element.y, element.image); // Рисуем изображение
            }
        });
    }

    canvas.addEventListener("mousedown", handleMouseDown); // Добавляем обработчик нажатия кнопки мыши
    canvas.addEventListener("mousemove", handleMouseMove); // Добавляем обработчик движения мыши
    canvas.addEventListener("mouseup", handleMouseUp); // Добавляем обработчик отпускания кнопки мыши

    const elements = []; // Массив для хранения всех элементов на canvas
    let selectedFont = "Arial"; // Выбранный шрифт по умолчанию

    document.getElementById("font").addEventListener("change", function (event) { // Добавляем обработчик изменения выбора шрифта
        selectedFont = event.target.value; // Получаем выбранный шрифт
        if (selectedElement && selectedElement.type === 'text') { // Если выбран текстовый элемент
            selectedElement.font = selectedFont; // Устанавливаем новый шрифт для элемента
            redrawCanvas(); // Перерисовываем canvas
        }
    });

    document.getElementById("addText").addEventListener("click", function () { // Добавляем обработчик нажатия на кнопку "Добавить текст"
        const text = prompt("Enter text:"); // Запрашиваем текст у пользователя
        if (text) { // Если текст был введен
            const color = prompt("Enter text color:"); // Запрашиваем цвет текста у пользователя
            const x = Math.random() * canvas.width; // Генерируем случайную позицию X
            const y = Math.random() * canvas.height; // Генерируем случайную позицию Y
            elements.push({ type: 'text', x, y, text, color, font: selectedFont }); // Добавляем новый текстовый элемент в массив
            redrawCanvas(); // Перерисовываем canvas
        }
    });

    document.getElementById("addImage").addEventListener("change", function (event) { // Добавляем обработчик выбора файла изображения
        const file = event.target.files[0]; // Получаем выбранный файл
        const reader = new FileReader(); // Создаем объект для чтения файла
        reader.onload = function (e) { // Добавляем обработчик события загрузки файла
            const image = new Image(); // Создаем новый элемент изображения
            image.onload = function () { // Добавляем обработчик события загрузки изображения
                const x = Math.random() * canvas.width; // Генерируем случайную позицию X
                const y = Math.random() * canvas.height; // Генерируем случайную позицию Y
                elements.push({ type: 'image', x, y, width: image.width, height: image.height, image }); // Добавляем новый элемент изображения в массив
                redrawCanvas(); // Перерисовываем canvas
            };
            image.src = e.target.result; // Устанавливаем источник изображения
        };
        reader.readAsDataURL(file); // Читаем выбранный файл как Data URL
    });

    document.getElementById("textEditor").addEventListener("change", function (event) { // Добавляем обработчик изменения текста в редакторе
        if (selectedElement) { // Если выбран элемент
            selectedElement.text = event.target.value; // Устанавливаем новый текст для выбранного элемента
            redrawCanvas(); // Перерисовываем canvas
        }
    });
});
