// TODO
// - Create Texturing


"use strict";

var canvas;
var gl;

var projectionMatrix,projectionMatrixLoc;
var modelMatrix, modelMatrixLoc;

var program;

var NumVertices  = 36;
var texSize = 64;

var points = [];
var colors = [];
var texCoordsArray = [];

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

var texture;

var MAZE1 =[[0,0,0,0,0,1,0,0,0,0],
            [0,0,0,0,0,1,0,1,0,0],
            [0,1,1,1,1,1,1,1,1,0],
            [0,0,1,0,0,0,0,0,1,0],
            [0,0,1,0,0,0,1,0,0,0],
            [0,0,1,1,1,0,1,1,1,0],
            [0,0,0,0,1,0,0,0,1,0],
            [0,1,1,1,1,1,1,1,1,0],
            [0,1,0,1,0,1,0,0,1,0],
            [0,0,0,0,0,1,0,0,0,0]];

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

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}


var tBuffer,vTexCoord;
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
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    cBuffer = gl.createBuffer();
    
    vColor = gl.getAttribLocation( program, "vColor" );
    
    vBuffer = gl.createBuffer();
    
    vPosition = gl.getAttribLocation( program, "vPosition" );


    tBuffer = gl.createBuffer();
    

    vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    

    var image = document.getElementById("texImage");

    configureTexture( image );
    
    projectionMatrix = mat4();
    projectionMatrixLoc = gl.getUniformLocation(program, "projection");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    modelMatrix = mat4();
    modelMatrixLoc = gl.getUniformLocation(program, "model");
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));

    thetaLoc = gl.getUniformLocation(program, "theta");

    drawSurface();
    createMaze(MAZE1);

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
            case 'r':
                executeR();
                break;
            case 'f':
                executeF();
                break;
            default:
                break;
        }
        switch(event.keyCode){
            case 37:
                executeLeft();
                break;
            case 38:
                executeUp();
                break;
            case 39:
                executeRight();
                break;
            case 40:
                executeDown();
                break;
            default:
                break;
        }
    });
    

    render();
}

var size = 0.4;
var blockSize = 1.5;

// Assuming maze is 10*10
var wallTranslations = [];
var wallPoints = [];
var wallColors = [];
var createMaze = function(maze){
    var blockUnit = 1;
    var width = size*100; // Width of surface
    var height = size*100; // Length of surface

    for(var i=0;i<maze.length;i++){
        for(var j=0;j<maze[i].length;j++){
            console.log('*')
            //wallTranslations.push(translate((height-blockSize-(blockSize*(i*2))),blockSize+size,blockSize-size))
            if(maze[i][j]==0){
                wallTranslations.push(translate(height-blockSize-(blockSize*i*2),blockSize+size,width-blockSize-(j*2*blockSize)))
            }
        }
    }

    /*wallTranslations = [
        translate(width-size, size*2, 0)
    ]*/

    quad( 1, 0, 3, 2, 8, true ); // Black face
    quad( 2, 3, 7, 6, 8, true ); // Red face
    quad( 3, 0, 4, 7, 8, true ); // Yellow face
    quad( 6, 5, 1, 2, 8, true ); // Green face
    quad( 4, 5, 6, 7, 8, true); // Blue
    quad( 5, 4, 0, 1, 8, true ); // Magenta

    wallPoints.push(points);
    wallColors.push(colors);
    points = [];
    colors = [];

}

var surfacePoints, surfaceColors;
function drawSurface()
{   
    
    // 0 - black || 1 - red || 2 - yellow || 3 - green || 4 - blue || 5 - magenta || 6 - cyan || 7 - grey
    quad( 1, 0, 3, 2, 0 ); // Black face
    quad( 2, 3, 7, 6, 0 ); // Red face
    quad( 3, 0, 4, 7, 0 ); // Yellow face
    quad( 6, 5, 1, 2, 3 ); // Green face
    quad( 4, 5, 6, 7, 0); // Blue
    quad( 5, 4, 0, 1, 0 ); // Magenta

    surfacePoints = points;
    points = [];
    surfaceColors = colors;
    colors = [];
    
}


//var size = 0.1;
function quad(a, b, c, d, color,isWall=false)
{
    if(isWall){
        size = blockSize;
        var vertices = [
            vec4( -size, -size,  size, 1.0 ),
            vec4( -size,  size,  size, 1.0 ),
            vec4(  size,  size,  size, 1.0 ),
            vec4( size, -size,  size, 1.0 ),
            vec4( -size, -size, -size, 1.0 ),
            vec4( -size, size, -size, 1.0 ),
            vec4(  size,  size, -size, 1.0 ),
            vec4(  size, -size, -size, 1.0 )
        ];
    }
    else{

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
    }

    var texCoord = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 0.5, 0.5, 0.5, 1.0 ],   // grey
        [ 1.0, 1.0, 1.0, 1.0 ]   // grey
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
    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[2]);
    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[2]);
    texCoordsArray.push(texCoord[3]);
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
var hitDistance = 3;
var curCollisionDist;
function checkCollision(points){
    var center = mat4(0);
    //console.log(hitDistance);
    //var hitDistance = 5;
    collisionExists = false;
    for(var i=0;i<points.length;i++){
        var dist = length(subtract(points[i],center));
        if(dist<hitDistance){
            collisionExists = true;
            //console.log('Collision Distance: ',dist);
            curCollisionDist = dist;
        }
    }
    
    
    return collisionExists;
}


var camSpeed = blockSize/2;
var rotAngle = 10;
var curAngle = 0;
var cam1=0,cam2=0,cam3=0;
var collisionExists;
var collisionPoints;
var lastPressed;
function executeW(){
    
    
    //cam1 -= camSpeed;
    //cam2 += camSpeed;
    //cam3 += camSpeed;
    console.log(curAngle)
    cam1 -= camSpeed*Math.cos(radians(curAngle));
    cam3 += camSpeed*Math.sin(radians(curAngle)); 

    
    lastPressed = 'W';
}
function executeA(){
    //cam1 += camSpeed;
    //cam2 += camSpeed;
    cam3 += camSpeed*Math.cos(radians(curAngle));
    cam1 += camSpeed*Math.sin(radians(curAngle));
    
    lastPressed = 'A';

}
function executeS(){
    
    //cam1 += camSpeed;
    //cam2 += camSpeed;
    //cam3 += camSpeed;
    cam1 += camSpeed*Math.cos(radians(curAngle));
    cam3 -= camSpeed*Math.sin(radians(curAngle)); 

    
    lastPressed = 'S';
    
}
function executeD(){
    //cam1 += camSpeed;
    //cam2 += camSpeed;

    //cam3 -= camSpeed;
    cam3 -= camSpeed*Math.cos(radians(curAngle));
    cam1 -= camSpeed*Math.sin(radians(curAngle));
    
    lastPressed = 'D';
    
}
function executeR(){
    //cam1 += camSpeed;
    //cam2 += camSpeed;
    cam2 += camSpeed;
    
    
}
function executeF(){
    //cam1 += camSpeed;
    //cam2 += camSpeed;
    cam2 -= camSpeed;
    
    
}
function executeLeft(){
    curAngle+=rotAngle;
}
function executeRight(){
    curAngle-=rotAngle;
}

function moveCamera(){
    modelMatrix = mult(modelMatrix,rotateY(curAngle));
    modelMatrix = mult(modelMatrix,translate(cam1, cam2, cam3));
   
    //projectionMatrix = mult(projectionMatrix,translate(cam1,cam2,cam3));
    if(checkCollision(collisionPoints)){
        switch(lastPressed){
            case 'W':
                cam1 += camSpeed*Math.cos(radians(curAngle));
                cam3 -= camSpeed*Math.sin(radians(curAngle)); 
                break;
            case 'A':
                cam3 -= camSpeed*Math.cos(radians(curAngle));
                cam1 -= camSpeed*Math.sin(radians(curAngle));
                break;
            case 'S':
                cam1 -= camSpeed*Math.cos(radians(curAngle));
                cam3 += camSpeed*Math.sin(radians(curAngle)); 
                break;
            case 'D':
                cam3 += camSpeed*Math.cos(radians(curAngle));
                cam1 += camSpeed*Math.sin(radians(curAngle));
                break;
            default:
                break;
        }
    }
}



function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    
    

    //modelMatrix = mult(modelMatrix,translate(-10,-0.55,-0.5))
    //modelMatrix = mult(modelMatrix,translate(0,-1,-blockSize))
    
    modelMatrix = mult(modelMatrix,translate(0,-2,-4))
    
    


    
    var projectionMatrix = mat4();
    

    projectionMatrix = mult(projectionMatrix,perspective(45.0, canvas.width / canvas.height, 1, 100.0));
    projectionMatrix = mult(projectionMatrix,translate(0,0,-2));
    projectionMatrix = mult(projectionMatrix,rotateY(10));
    projectionMatrix = mult(projectionMatrix,rotateX(-60));
    
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    


    
    //trans[i] = checkCache(trans[i],i);
    //modelMatrixNew = mult(modelMatrix, trans[i]);
    //modelMatrixNew = mult(modelMatrix,translate(-dist, dist, -dist));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));

    

    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(surfaceColors), gl.STATIC_DRAW );

    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(surfacePoints), gl.STATIC_DRAW );

    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices);
    




    
    // Additional points
    collisionPoints = [];
    for(var i=0;i<wallTranslations.length;i++){
        var modelMatrixNew;
        modelMatrixNew = mult(modelMatrix,wallTranslations[i])
        collisionPoints.push(modelMatrixNew);
        gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrixNew));

        

        gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(wallColors[0]), gl.STATIC_DRAW );

        gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vColor );

        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(wallPoints[0]), gl.STATIC_DRAW );

        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );

        gl.drawArrays( gl.TRIANGLES, 0, NumVertices);
    }

    // Check for collision
    collisionExists = checkCollision(collisionPoints);
    
    moveCube();
    moveCamera();
    
    
    
    //console.log(length(projectionMatrix))

    /*var modelMatrixNew;
    modelMatrixNew = mult(modelMatrix,wallTranslations[0])
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrixNew));

    

    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(wallColors[0]), gl.STATIC_DRAW );

    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(wallPoints[0]), gl.STATIC_DRAW );

    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices);*/

    



    requestAnimFrame( render );
    
}
