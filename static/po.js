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


window.onload = function () {
    document.getElementById("create").addEventListener("click", function () {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", document.URL+"/api/template");
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        // const body = JSON.stringify({});
        xhr.onload = () => {
            if (xhr.status == 201) {
                console.log(JSON.parse(xhr.responseText));
            } else {
                console.log(`Error: ${xhr.status}`);
            }
        };
        xhr.send();
    })
}
