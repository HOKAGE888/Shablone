// МОДАЛЬНОЕ ОКНО
// window.onload = function () {
//     var modal = document.getElementById('myModal');

//     var btn = document.getElementById("filter");

//     var span = document.getElementsByClassName("close")[0];

//     btn.onclick = function () {
//         modal.style.display = "block";
//     }

//     span.onclick = function () {
//         modal.style.display = "none";
//     }

//     window.onclick = function (event) {
//         if (event.target == modal) {
//             modal.style.display = "none";
//         }
//     }
// };


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