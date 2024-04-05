// МОДАЛЬНОЕ ОКНО

// Код для обработки нажатия на кнопку открытия модального окна
document.getElementById('openModalBtn').addEventListener('click', function() {
    document.getElementById('myModal').style.display = 'block';
});


// Функция для загрузки данных JSON из API
function fetchData(url, callback) {
    fetch(url)
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => console.error('Ошибка загрузки данных:', error));
}

// Функция для заполнения выпадающего списка
function populateDropdown(jsonData) {
    const dropdown = document.getElementById('brand');
    // Очистка списка перед добавлением новых элементов
    dropdown.innerHTML = '';
    // Добавление элементов из JSON в список
    jsonData.entities.forEach(entity => {
        const option = document.createElement('option');
        option.value = entity.id;
        option.textContent = entity.name;
        dropdown.appendChild(option);
    });
}

// URL API
const apiUrl = 'http://127.0.0.1:5000/api/brand';

// Вызов функции загрузки данных и заполнения списка при загрузке страницы
window.addEventListener('load', () => {
    fetchData(apiUrl, populateDropdown);
});


// Код для обработки нажатия на кнопку закрытия модального окна
document.getElementById('closeModalBtn').addEventListener('click', function() {
    document.getElementById('myModal').style.display = 'none';
});