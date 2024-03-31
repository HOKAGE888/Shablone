template_pattern = []

default_template = {
    "text": {
        "id": "0",
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
            "margin-top": `${(document.documentElement.scrollHeight) / 2}px`,
            "margin-left": `${(document.documentElement.scrollWidth) / 2}px`,
        },
        "content": "Текст",
        "tag": "text",
    },
    "img": {
        "id": "0",
        "style": {
            "z-index": "5",
            "background-color": "#dadada",
            "width": "80px",
            "height": "80px",
            "margin-top": "0px",
            "margin-left": "0px",
            "position": "absolute",
            "background-image": "url(https://static.tildacdn.com/tild3362-3037-4133-a534-333837306166/_2022-06-29_12011419.png)",
            "background-size": "cover",
            "background-repeat": "no-repeat"
        },
        "const": {
            "margin-top": `${(document.documentElement.scrollHeight) / 2}px`,
            "margin-left": `${(document.documentElement.scrollWidth) / 2}px`,
        },
        "tag": "img"
    }
}

current_id = 0

function set_template_settings(id){
    need_element = {}
    console.log("Start search")
    for (let index = 0; index < template_pattern.length; index++) {
        if (template_pattern[index]["id"] == id){
            need_element = template_pattern[index]
            break
        }
    }
    console.log(need_element["style"])
    for (const [key, value] of Object.entries(need_element["style"])) {
        current_parametr = document.getElementById(key)
        if (current_parametr != null){
            current_parametr.value = value
        }
    }
    
}

function update_view() {
    main = document.getElementById("main")
    main.innerHTML = ""
    template_pattern.forEach(element => {
        innerElement = `<${element["tag"]} id="${element["id"]}" style="`
        for (const [key, value] of Object.entries(element["style"])) {
            if (key in element["const"]){
                innerElement+=`${key}: calc(${element["const"][key]} + ${value}); `    
            }else{
                innerElement+=`${key}: ${value}; `
            }
        }
        innerElement += '">'
        if (element["content"] != null) {
            innerElement += `${element["content"]}</${element["tag"]}>`
        }
        main.innerHTML += innerElement
    });
}


id = 0
window.onload = function () {
    update_view()
    document.getElementById("add-text").addEventListener('click', function () {
        add_element("text")
    })

    document.getElementById("add-img").addEventListener('click', function () {
        add_element("img")
    })

    document.querySelectorAll("input").forEach(element =>{
        // update_parametr(current_id, )
        element.addEventListener("input", function () {
            update_parametr(current_id, element.id, element.value)
        })
    })


}

function add_element(type){
    id += 1
    new_elemetn = {...default_template[type]}
    new_elemetn["id"] = String(id)
    template_pattern.push(new_elemetn)
    update_view()
    set_template_settings(id)
}

function update_parametr(id, parametr_name, value){
    template_pattern[Number(id)]["style"][parametr_name] = value
    update_view()
    set_template_settings(id)
}