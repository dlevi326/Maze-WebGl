// TODO
// - Work on loading and saving the cube


"use strict";

var canvas;
var gl;

var projectionMatrix,projectionMatrixLoc;
var modelMatrix, modelMatrixLoc;

var NumVertices  = 36;

var points = [];
var colors = [];

var thetaLoc;
var theta = 2;
var phi = -1;

var dragging = false;

var oldX, oldY;
var dX, dY;

// Trackball vars
var trackingMouse = false;
var  trackballMove = false;

var lastPos = [0, 0, 0];
var curx, cury;
var startX, startY;

var  axis = [0, 0, 1];
var  angle = 0.0;

var dragSensitivity = -50;

var cBuffer, vColor, vBuffer, vPosition;

var cachedMoves = [];
var cachedDirs = [];

var AMORTIZATION = 0.95;
var drag = false;
var old_x, old_y;
var dX = 0, dY = 0;
var THETA = 0;
var PHI = 0;

var isMoving = false;

var savedMoves = [];
var savedDirs = [];

function maze(x, y) {
    var n = x * y - 1;
    var verti,here,path,unvisited,next;
    if (n < 0) {
       alert("illegal maze dimensions");
       return;
    }
    var horiz = [];
    for (var j = 0; j < x + 1; j++) horiz[j] = [];
        verti = [];
    for (var j = 0; j < y + 1; j++) verti[j] = [],
       here = [Math.floor(Math.random() * x), Math.floor(Math.random() * y)],
       path = [here],
       unvisited = [];
    for (var j = 0; j < x + 2; j++) {
       unvisited[j] = [];
       for (var k = 0; k < y + 1; k++)
          unvisited[j].push(j > 0 && j < x + 1 && k > 0 && (j != here[0] + 1 || k != here[1] + 1));
    }
    while (0 < n) {
       var potential = [
          [here[0] + 1, here[1]],
          [here[0], here[1] + 1],
          [here[0] - 1, here[1]],
          [here[0], here[1] - 1]
       ];
       var neighbors = [];
       for (var j = 0; j < 4; j++)
          if (unvisited[potential[j][0] + 1][potential[j][1] + 1])
             neighbors.push(potential[j]);
       if (neighbors.length) {
          n = n - 1;
          next = neighbors[Math.floor(Math.random() * neighbors.length)];
          unvisited[next[0] + 1][next[1] + 1] = false;
          if (next[0] == here[0])
             horiz[next[0]][(next[1] + here[1] - 1) / 2] = true;
          else
             verti[(next[0] + here[0] - 1) / 2][next[1]] = true;
          path.push(here = next);
       } else
          here = path.pop();
    }
    return { x: x, y: y, horiz: horiz, verti: verti };
 }


var mouseDown = function( e ) {
    dragging = true;
    oldX = e.pageX;
    oldY = e.pageY;
    e.preventDefault();
    return false;
};

var mouseUp = function( e ) {
    dragging = false;
};

var mouseMove = function( e ) {
    if ( !dragging ) {
        return false;
    }
    dX = ( e.pageX - oldX ) * 2 * Math.PI / canvas.width;
    dY = ( e.pageY - oldY ) * 2 * Math.PI / canvas.height;
    theta -= dX;
    phi -= dY;
    oldX = e.pageX;
    oldY = e.pageY;
    e.preventDefault();
};



window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    

    gl.viewport( 0, 0,canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    cBuffer = gl.createBuffer();
    
    vColor = gl.getAttribLocation( program, "vColor" );
    
    vBuffer = gl.createBuffer();
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    
    projectionMatrix = mat4();
    projectionMatrixLoc = gl.getUniformLocation(program, "projection");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    modelMatrix = mat4();
    modelMatrixLoc = gl.getUniformLocation(program, "model");
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));

    thetaLoc = gl.getUniformLocation(program, "theta");

    var mazer = maze(10,10);
    
    for(var i=0;i<10;i++){
        var word = "";
        for(var j=0;j<10;j++){
            word+=mazer.horiz[j];
        }
        console.log(word);
    }
    console.log(maze(10,10));

    drawSurface();

    //event listeners for buttons

    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup", mouseUp, false);
    canvas.addEventListener("mouseout", mouseUp, false);
    canvas.addEventListener("mousemove", mouseMove, false);

    document.addEventListener('keydown', function(event) {
        switch(event.key){
            case 'w':
                executeW();
                break;
            case 'a':
                executeA();
                break;
            case 's':
                executeS();
                break;
            case 'd':
                executeD();
                break;
            default:
                break;
        }
    });
    

    render();
}



function drawSurface()
{   
    
    // 0 - black || 1 - red || 2 - yellow || 3 - green || 4 - blue || 5 - magenta || 6 - cyan || 7 - grey
    quad( 1, 0, 3, 2, 0 ); // Black face
    quad( 2, 3, 7, 6, 0 ); // Red face
    quad( 3, 0, 4, 7, 0 ); // Yellow face
    quad( 6, 5, 1, 2, 3 ); // Green face
    quad( 4, 5, 6, 7, 0); // Blue
    quad( 5, 4, 0, 1, 0 ); // Magenta
    
}


var size = 0.1;
function quad(a, b, c, d, color)
{

    /*var vertices = [
        vec4( -size, -size,  size, 1.0 ),
        vec4( -size,  size,  size, 1.0 ),
        vec4(  size,  size,  size, 1.0 ),
        vec4( size, -size,  size, 1.0 ),
        vec4( -size, -size, -size, 1.0 ),
        vec4( -size, size, -size, 1.0 ),
        vec4(  size,  size, -size, 1.0 ),
        vec4(  size, -size, -size, 1.0 )
    ];*/

    var vertices = [
        vec4( -size, -size,  size*100, 1.0 ),
        vec4( -size,  size,  size*100, 1.0 ),
        vec4(  size*100,  size,  size*100, 1.0 ),
        vec4( size*100, -size,  size*100, 1.0 ),
        vec4( -size, -size, -size, 1.0 ),
        vec4( -size, size, -size, 1.0 ),
        vec4(  size*100,  size, -size, 1.0 ),
        vec4(  size*100, -size, -size, 1.0 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 0.5, 0.5, 0.5, 1.0 ]   // grey
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];
    var tempArr = [];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        tempArr.push(vertices[indices[i]]);

        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[color]);

    }
    //console.log(points);
}

var rotationMatrixTrans;


function moveCube(){
    var sensitivity = -50;

    modelMatrix = mat4();
    var c = Math.cos( radians( dragSensitivity * phi ) );
    var s = Math.sin( radians( dragSensitivity * phi ) );
    var mv1 = modelMatrix[0][1], mv5 = modelMatrix[1][1], mv9 = modelMatrix[2][1];
    modelMatrix[0][1] = modelMatrix[0][1] * c - modelMatrix[0][2] * s;
    modelMatrix[1][1] = modelMatrix[1][1] * c - modelMatrix[1][2] * s;
    modelMatrix[2][1] = modelMatrix[2][1] * c - modelMatrix[2][2] * s;
    modelMatrix[0][2] = modelMatrix[0][2] * c + mv1 * s;
    modelMatrix[1][2] = modelMatrix[1][2] * c + mv5 * s;
    modelMatrix[2][2] = modelMatrix[2][2] * c + mv9 * s;
    c = Math.cos( radians( dragSensitivity * theta ) );
    s = Math.sin( radians( dragSensitivity * theta ) );
    var mv0 = modelMatrix[0][0], mv4 = modelMatrix[1][0], mv8 = modelMatrix[2][0];
    modelMatrix[0][0] = modelMatrix[0][0] * c + modelMatrix[0][2] * s;
    modelMatrix[1][0] = modelMatrix[1][0] * c + modelMatrix[1][2] * s;
    modelMatrix[2][0] = modelMatrix[2][0] * c + modelMatrix[2][2] * s;
    modelMatrix[0][2] = modelMatrix[0][2] * c - mv0 * s;
    modelMatrix[1][2] = modelMatrix[1][2] * c - mv4 * s;
    modelMatrix[2][2] = modelMatrix[2][2] * c - mv8 * s;

}


var camSpeed = 0.05;
var cam1=0,cam2=0,cam3=0;
function executeW(){
    cam1 += camSpeed;
    //cam2 += camSpeed;
    //cam3 += camSpeed;
}
function executeA(){
    //cam1 += camSpeed;
    //cam2 += camSpeed;
    cam3 += camSpeed;
}
function executeS(){
    cam1 -= camSpeed;
    //cam2 += camSpeed;
    //cam3 += camSpeed;
}
function executeD(){
    //cam1 += camSpeed;
    //cam2 += camSpeed;
    cam3 -= camSpeed;
}

function moveCamera(){
    modelMatrix = mult(modelMatrix,translate(cam1, cam2, cam3));
}






var dist = (size + .1) + .01;
var translations = [
    // +/-
    // move right/left, up/down , move back/front
    
    translate(-dist, dist, -dist),
    translate(0, dist, -dist),
    translate(dist,dist,-dist),
    translate(-dist,0,-dist),
    translate(0 ,0, -dist),
    translate(dist,0,-dist),
    translate(-dist,-dist,-dist),
    translate(0,-dist,-dist),
    translate(dist,-dist,-dist),

    translate(-dist,dist,0),
    translate(0,dist,0),
    translate(dist,dist,0),
    translate(-dist,0,0),
    translate(0,0,0),
    translate(dist,0,0),
    translate(-dist,-dist,0),
    translate(0,-dist,0),
    translate(dist,-dist,0),

    translate(-dist,dist,dist),
    translate(0,dist,dist),
    translate(dist,dist,dist),
    translate(-dist,0,dist),
    translate(0,0,dist),
    translate(dist,0,dist),
    translate(-dist,-dist,dist),
    translate(0,-dist,dist),
    translate(dist,-dist,dist)
]
const origTrans = [
    // +/-
    // move right/left, up/down , move back/front
    
    translate(-dist, dist, -dist),
    translate(0, dist, -dist),
    translate(dist,dist,-dist),
    translate(-dist,0,-dist),
    translate(0 ,0, -dist),
    translate(dist,0,-dist),
    translate(-dist,-dist,-dist),
    translate(0,-dist,-dist),
    translate(dist,-dist,-dist),

    translate(-dist,dist,0),
    translate(0,dist,0),
    translate(dist,dist,0),
    translate(-dist,0,0),
    translate(0,0,0),
    translate(dist,0,0),
    translate(-dist,-dist,0),
    translate(0,-dist,0),
    translate(dist,-dist,0),

    translate(-dist,dist,dist),
    translate(0,dist,dist),
    translate(dist,dist,dist),
    translate(-dist,0,dist),
    translate(0,0,dist),
    translate(dist,0,dist),
    translate(-dist,-dist,dist),
    translate(0,-dist,dist),
    translate(dist,-dist,dist)
];








function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    
    moveCube();

    modelMatrix = mult(modelMatrix,translate(-0.5,0,-0.5))

    moveCamera();


    
    //trans[i] = checkCache(trans[i],i);
    //modelMatrixNew = mult(modelMatrix, trans[i]);
    //modelMatrixNew = mult(modelMatrix,translate(-dist, dist, -dist));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));

    

    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices);
    

    

    

    //gl.drawArrays( gl.TRIANGLES, 0, NumVertices);

    requestAnimFrame( render );
    
}
