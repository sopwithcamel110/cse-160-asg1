var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main(){
        gl_Position = a_Position;
        gl_PointSize =u_Size;
    }`


var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' + 
    'void main() {\n' +
    '  gl_FragColor = u_FragColor;\n' +
    '}\n';

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
    // Get reference to canvas
    canvas = document.getElementById('webgl');

    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
        console.log("failed to get rendering content of web gl.");
        return;
    }
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("failed to initialize shaders.");
        return;
    }
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log("Failed ti get the storage location of u_Size");
        return;
    }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 0, 0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
var g_shapesList = [];

function serialize_shape_list(shapes) {
    let final = ""
    for (let i = 0; i < shapes.length; i++) {
        let s = "("
        let shape = shapes[i]
        if (shape.type === "circle") {
            s += "c-" + shape.segments.toString()
        }
        else if (shape.type === "triangle") {
            s += "t"
        }
        else {
            s += "p"
        }
        s += "," + shape.position.toString()
        s += "," + shape.color.toString()
        s += "," + shape.size.toString()
        s += ")"
        final += s + " "
    }
    return final
}

function deserialize_shape_str(shape_str) {
    let raw_shapes = shape_str.split(" ")
    let shapes = []
    for (let i = 0; i < raw_shapes.length; i++) {
        let shape;
        let [type, x, y, r, g, b, a, size] = raw_shapes[i].split(",")
        if (type[0] === 'c') {
            shape = new Circle()
            shape.segments = parseInt(type.substring(2))
        }
        else if (type === 't') {
            shape = new Triangle()
        }
        else {
            shape = new Point()
        }
        shape.position = [parseFloat(x), parseFloat(y)];
        shape.color = [parseFloat(r),parseFloat(g),parseFloat(b),parseFloat(a)];
        shape.size = parseFloat(size);
        shapes.push(shape);
    }
    return shapes
}

function addActionsForhtmlUI() {
    document.getElementById('red').onclick = function () {
        g_selectedColor = [1.0, 0.0, 0.0, 1.0];
    }
    document.getElementById('green').onclick = function () {
        g_selectedColor = [0.0, 1.0, 0.0, 1.0];
    }
    document.getElementById('blue').onclick = function () {
        g_selectedColor = [0.0, 0.0, 1.0, 1.0];
    }

    document.getElementById('clearButton').onclick = function () {
        g_shapesList = [];
        renderAllShapes();
    }
    document.getElementById('drawPic').onclick = function () {
        drawpic();
    }


    document.getElementById('pointButton').onclick = function () {
        g_selectedType = POINT;
    }
    document.getElementById('triButton').onclick = function () {
        g_selectedType = TRIANGLE;
    }
    document.getElementById('circleButton').onclick = function () {
        g_selectedType = CIRCLE;
    }


    document.getElementById('redSlide').addEventListener('mouseup', function () {
        g_selectedColor[0] = this.value / 100;
    });
    document.getElementById('greenSlide').addEventListener('mouseup', function () {
        g_selectedColor[1] = this.value / 100;
    });
    document.getElementById('blueSlide').addEventListener('mouseup', function () {
        g_selectedColor[2] = this.value / 100;
    });
    document.getElementById('opacSlide').addEventListener('mouseup', function () {
        g_selectedColor[3] = this.value / 100;
    });
    document.getElementById('sizeSlide').addEventListener('mouseup', function () {
        g_selectedSize = this.value;
    });

}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForhtmlUI();
    canvas.onmousedown = click;
    canvas.onmousemove = function (ev) {
        if (ev.buttons == 1) {
            click(ev);
        }
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function click(ev) {
    let [x, y] = convertCoordinatesEventToGL(ev);

    let shape;
    if (g_selectedType == POINT) {
        shape = new Point();
    } else if (g_selectedType == TRIANGLE) {
        shape = new Triangle();
    } else if (g_selectedType == CIRCLE) {
        shape = new Circle();
    }
    shape.position = [x, y];
    shape.color = g_selectedColor.slice();
    shape.size = g_selectedSize;
    g_shapesList.push(shape);
    document.getElementById('serialtext').value = serialize_shape_list(g_shapesList)
    renderAllShapes();
}

function drawpic() {
    g_shapesList = deserialize_shape_str(document.getElementById('serialtext').value)
    renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX;
    var y = ev.clientY; 
    var rect = ev.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
    return ([x, y]);
}

function renderAllShapes() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    var len = g_shapesList.length;
    for (var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }
}
