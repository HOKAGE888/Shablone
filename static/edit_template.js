template_pattern = [
    {
        "id": "1",
        "style": {
            "margin-left": "500px",
            "z-index": "1",
            "margin-top": "50px",
            "position": "absolute",
            "width": "600px",   
            "height": "800px",
            "background-color": "#ffffff",
        },
    },
    {
        "id": "2",
        "style": {
            "z-index": "5",
            "margin-left": "500px",
            "margin-top": "50px",
            "position": "absolute",
            "width": "200px",
            "height": "300px",
            "background-color": "#ff00ff"
        }
    },
    {
        "id": "2",
        "style": {
            "z-index": "5",
            "margin-left": "600px",
            "margin-top": "150px",
            "position": "absolute",
            "width": "300px",
            "height": "700px",
            "background-image": "url('https://fikiwiki.com/uploads/posts/2022-02/1645054787_23-fikiwiki-com-p-kartinki-ikonki-23.png')",
            "background-color": "transparent",
            "background-size": "100% 100%"  
        },
        // "src": "https://w7.pngwing.com/pngs/922/837/png-transparent-computer-icons-others-angle-text-rectangle.png"
    }

]

function update_template_view() {
    add_element(template_pattern)
}

function add_element(element) {

    for (let index = 0; index < template_pattern.length; index++) {
        innerElement = '<div '
        for (const [key, value] of Object.entries(template_pattern[index])) {
            if (typeof (value) == 'string') {
                innerElement += `${key}="${value}"`;
            } else {
                if (key == "style") {
                    innerElement += 'style="'
                    for (const [key_style, value_style] of Object.entries(template_pattern[index][key])) {
                        innerElement += `${key_style}: ${value_style};  `;
                    }
                    innerElement += '"'
                }
            }
        }
        innerElement += '></div>'
        console.log(innerElement)
        document.getElementById("main").innerHTML += innerElement
    }
}

/* <a href="https://www.flaticon.com/ru/free-icons/-image"</a> */


window.onload = function () {
    update_template_view()
}
