let fileInput;
let canvas;

document.addEventListener("DOMContentLoaded", (event) => {
    fileInput = document.getElementById('file-input') 
    // fileInput.addEventListener("change", load_image, false);
    canvas = document.getElementById('pattern')
    // canvas.dataMaxWidth = canvas.width;
    // canvas.dataMaxHeight = canvas.height;
});


function open_file_dialog(){
    fileInput.click();
}

function load_image(e) {
    const context = canvas.getContext('2d');
    const image = new Image();
    image.onload = () => {
        var scaled = getScaledDim(image, context.canvas.dataMaxWidth, context.canvas.dataMaxHeight);
        context.canvas.width = scaled.width;
        context.canvas.height = scaled.height;
        context.drawImage(image, 0, 0
            , context.canvas.width, context.canvas.height
            );
        };
    const reader = new FileReader()
    const file = e.target.files[0];
    reader.onloadend = function () {
        image.src = reader.result;
    }
    reader.readAsDataURL(file);
}

function getScaledDim(img, maxWidth, maxHeight) {
    var scaled = {
        ratio: img.width / img.height,
        width: img.width,
        height: img.height
    }
    if (scaled.width > maxWidth) {
        scaled.width = maxWidth;
        scaled.height = scaled.width / scaled.ratio;
    }
    if (scaled.height > maxHeight) {
        scaled.height = maxHeight;
        scaled.width = scaled.height / scaled.ratio;
    }
    return scaled;
}