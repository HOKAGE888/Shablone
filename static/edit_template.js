template_pattern = []

//     "id": "1",
//     "style": {

//         "z-index": "1",
//         "position": "absolute",
//         "width": "600px",   
//         "height": "800px",
//         "background-color": "#ffffff",
//     },
//     "class": "for-js-background",
//     "const": {

//     }
// },
// {
//     "id": "2",
//     "style": {
//         "z-index": "5",
//         "margin-left": "500px",
//         "margin-top": "50px",
//         "position": "absolute",
//         "width": "200px",
//         "height": "300px",
//         "background-color": "#ff00ff"
//     }
// },
// {
//     "id": "2",
//     "style": {
//         "z-index": "5",
//         "margin-left": "600px",
//         "margin-top": "150px",
//         "position": "absolute",
//         "width": "300px",
//         "height": "700px",
//         "background-image": "url('https://fikiwiki.com/uploads/posts/2022-02/1645054787_23-fikiwiki-com-p-kartinki-ikonki-23.png')",
//         "background-color": "transparent",
//         "background-size": "100% 100%"  
//     },
//     // "src": "https://w7.pngwing.com/pngs/922/837/png-transparent-computer-icons-others-angle-text-rectangle.png"
// }
// ]

function update_template_view() {
    add_element(template_pattern)
}

function add_element(element) {
    main = document.getElementById("main")
    main.innerHTML = ""
    for (let index = 0; index < template_pattern.length; index++) {
        innerElement = '<div '
        for (const [key, value] of Object.entries(template_pattern[index])) {
            if (typeof (value) == 'string') {
                innerElement += `${key}="${value}"`;
            } else {
                if (key == "style") {
                    innerElement += 'style="'
                    console.log(template_pattern)
                    for (const [key_style, value_style] of Object.entries(template_pattern[index][key])) {

                        if (template_pattern[index]["const"]?.[key_style] != undefined) {
                            innerElement += `${key_style}: calc(${value_style} + ${template_pattern[index]["const"][key_style]});  `
                        } else {
                            innerElement += `${key_style}: ${value_style};  `;
                        }

                    }
                    innerElement += '"'
                }
            }
        }
        innerElement += '>'
        console.log(typeof(template_pattern[index]?.content), template_pattern[index]?.content)
        innerElement+=  (template_pattern[index]?.content) != undefined ? template_pattern[index]?.content : "" 
        innerElement += '</div>'
        // console.log(innerElement)

        main.innerHTML += innerElement
    }
}

/* <a href="https://www.flaticon.com/ru/free-icons/-image"</a> */

id = 0
window.onload = function () {
    update_template_view()
    document.getElementById("add-text").addEventListener('click', function () {
        id += 1
        template_pattern.push(
            {
                "id": String(id),
                "style": {
                    "z-index": "5",
                    'font-size': "2em",
                    "background-color": "#dadada",
                    "width": "80px",
                    "height": "35px",
                    "margin-top": "0px",
                    "margin-left": "0px",
                    "position": "absolute",
                    "word-wrap": "break-word",
                },
                "const": {
                    "margin-top": `${(document.documentElement.scrollWidth - 100) / 2}px`,
                    "margin-left": `${(document.documentElement.scrollWidth - 100) / 2}px`,
                },
                "content": "Текст"
            }
        )
        add_element()
    })
}
