class Triangle{
    constructor() {
        this.type = 'triangle';
        this.position = [0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }
    render(){
        var xy = this.position;
        var rgb = this.color;
        gl.uniform4f(u_FragColor, rgb[0], rgb[1], rgb[2], rgb[3]);
        gl.uniform1f(u_Size, this.size);

        var d = this.size/200.0;
        drawTriangle([xy[0],xy[1],xy[0]+d,xy[1],xy[0],xy[1]+d]);
    }
}



function drawTriangle(vertices){
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // write data to buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(a_Position);
    var n = 3; 
    gl.drawArrays(gl.TRIANGLES,0,n);
}