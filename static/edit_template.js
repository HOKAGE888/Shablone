template_pattern = [
    {
        "id": "1",
        "style": {
            "margin-left": "500px",
            "z-index": "4",
            "margin-top": "50px",
            "position": "absolute",
            "width": "600px",
            "height": "800px",
            "background-color": "#ffffff",
        },
        "value": "shdfksjdhfj"
    },
    {
        "id": "2",
        "style": {
            "z-index": "5",
            "margin-left": "500px",
            "margin-top": "50px",
            "width": "200px",
            "height": "300px",
            "background-color": "#ff00ff"
        }
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
