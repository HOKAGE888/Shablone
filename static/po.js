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
