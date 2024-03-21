template_pattern = [
    {
        "id": "1",
        "style": {
            
            "z-index": "1",
            "position": "absolute",
            "width": "600px",   
            "height": "800px",
            "background-color": "#ffffff",
        },
        "class": "for-js-background",
        "const": {

        }
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
            } else if (key == "const") {
                
            } else {
                if (key == "style") {
                    innerElement += 'style="'
                    for (const [key_style, value_style] of Object.entries(template_pattern[index][key])) {
                        if ("const" in template_pattern && key_style in template_pattern["const"]){
                            innerElement += `${key_style}: calc(${value_style} + ${template_pattern["const"][key_style]});  ` 
                        } else {
                          innerElement += `${key_style}: ${value_style};  `;  
                        }
                        
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

id = 0
window.onload = function () {
    update_template_view()
    document.getElementById("add-text").addEventListener('click', function(){
            id+=1
            template_pattern.push(
                {
                    "id":String(id),
                    "style": {
                        "background-color": "#dadada",
                        "width": "100px",
                        "height": "100px",
                        "margin-top": "0px",
                        "margin-left": "0px"
                    },
                    "const":{
                        "margin-top": `${(document.documentElement.scrollWidth-100)/2}px`,
                        "margin-left": `${(document.documentElement.scrollWidth-100)/2}px`,
                    }
                }
            )
        add_element()
    })
}