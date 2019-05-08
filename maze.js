// TODO
// - Create light sources


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
var normalsArray = [];

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
            [0,0,1,0,0,1,0,1,0,0],
            [0,1,1,1,1,1,1,1,1,0],
            [0,0,1,0,0,0,0,0,1,0],
            [0,0,1,0,0,0,1,0,0,0],
            [0,0,1,1,1,0,1,1,1,0],
            [0,0,0,0,1,0,0,0,1,0],
            [0,1,1,1,1,1,1,1,1,0],
            [0,1,0,1,0,1,0,0,1,0],
            [0,0,0,0,0,1,0,0,0,0]];
// Start, End
var mazeStartEnd1 = [[9,5],[0,5]];

var MAZE2 = [[0,0,0,0,0,0,0,1,0,0],
             [0,1,1,1,0,0,0,1,1,0],
             [0,1,0,1,1,1,0,0,1,0],
             [0,1,0,0,0,1,1,1,1,0],
             [0,1,1,1,0,1,0,0,0,0],
             [0,1,0,1,0,1,1,0,1,0],
             [0,1,0,0,0,0,1,0,1,0],
             [0,1,1,0,0,0,0,0,1,0],
             [0,0,1,1,1,1,1,1,1,0],
             [0,0,1,0,0,0,0,0,0,0]];
var mazeStartEnd2 = [[9,2],[0,7]];

var MAZE3 = [[0,0,0,1,0,0,0,0,0,0],
             [0,1,1,1,0,1,1,1,1,0],
             [0,1,0,0,0,0,0,0,1,0],
             [0,1,0,1,0,1,1,1,1,0],
             [0,1,0,1,0,1,0,1,0,0],
             [0,1,1,1,0,1,0,0,0,0],
             [0,1,0,0,0,1,1,1,1,0],
             [0,1,1,1,1,1,0,0,1,0],
             [0,0,1,0,1,0,0,1,1,0],
             [0,0,0,0,0,0,0,0,1,0]];
var mazeStartEnd3 = [[9,8],[0,3]];

var startEnd = [mazeStartEnd1,mazeStartEnd2,mazeStartEnd3];


//var lightPosition = vec4(100.0, 0.0, 0.0, 0.0 );
var lightPosition = vec4(-10.0, 0.0, 0.0, 1.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ambientColor, diffuseColor, specularColor;



var count = 0; 
var clearTime; 
var seconds = 0, minutes = 0, hours = 0; 
var clearState; 
var secs, mins, gethours ; 
var timerRun;
var topScores = [10000,10000,10000];
function startWatch( ) { /* check if seconds is equal to 60 and add a +1 to minutes, and set seconds to 0 */ 
    if ( seconds === 60 ) { 
        seconds = 0; minutes = minutes + 1; 
    } /* you use the javascript tenary operator to format how the minutes should look and add 0 to minutes if less than 10 */ 
    mins = ( minutes < 10 ) ? ( '0' + minutes + ': ' ) : ( minutes + ': ' ); /* check if minutes is equal to 60 and add a +1 to hours set minutes to 0 */ 
    if ( minutes === 60 ) { 
        minutes = 0; 
        hours = hours + 1; 
    } /* you use the javascript tenary operator to format how the hours should look and add 0 to hours if less than 10 */ 
    gethours = ( hours < 10 ) ? ( '0' + hours + ': ' ) : ( hours + ': ' ); 
    secs = ( seconds < 10 ) ? ( '0' + seconds ) : ( seconds ); // display the stopwatch 
    var x = document .getElementById("timer"); 
    x.innerHTML = '<str>Time Start!<str><br>Time: ' + gethours + mins + secs+'</br>'; /* call the seconds counter after displaying the stop watch and increment seconds by +1 to keep it counting */ 
    seconds++; /* call the setTimeout( ) to keep the stop watch alive ! */ 
    clearTime = setTimeout( "startWatch( )", 1000 ); 
} // startWatch( ) //create a function to start the stop watch 
function startTime( ) { /* check if seconds, minutes, and hours are equal to zero and start the stop watch */ 
    if ( seconds === 0 && minutes === 0 && hours === 0 ) { /* hide the fulltime when the stop watch is running */ 
    var fulltime = document.getElementById( "fulltime" ); 
    fulltime.style.display = "none"; /* hide the start button if the stop watch is running */ 
    //this.style.display = "none"; /* call the startWatch( ) function to execute the stop watch whenever the startTime( ) is triggered */ 
    timerRun=true;
    startWatch( ); 
    } // if () 
} // startTime() /* you need to bind the startTime( ) function to any event type to keep the stop watch alive ! */ 
//create a function to stop the time 
function stopTime( ) { /* check if seconds, minutes and hours are not equal to 0 */ 
    if ( seconds !== 0 || minutes !== 0 || hours !== 0 ) { /* display the full time before reseting the stop watch */ 
        var fulltime = document .getElementById( "fulltime" ); //display the full time 
        fulltime.style.display = "block"; 
        var time = gethours + mins + secs; 
        var actualTime = hours*3600+minutes*60+seconds;
        if(actualTime<topScores[0]){
            topScores[2] = topScores[1];
            topScores[1] = topScores[0];
            topScores[0] = actualTime;
        }
        else if(actualTime<topScores[1]){
            topScores[2] = topScores[1];
            topScores[1] = actualTime;
        }
        else if(actualTime<topScores[2]){
            topScores[2] = actualTime;
        }
        fulltime.innerHTML = 'Completed maze in: ' + time+'<br>Top times are:</br><ol><li>'+topScores[0]+' seconds</li><li>'+topScores[1]+' seconds</li><li>'+topScores[2]+' seconds</li></ol></br>'; // reset the stop watch 
        seconds = 0; minutes = 0; hours = 0; secs = '0' + seconds; mins = '0' + minutes + ': '; gethours = '0' + hours + ': '; /* display the stopwatch after it's been stopped */ 
        var x = document.getElementById ("timer"); var stopTime = gethours + mins + secs; x.innerHTML = stopTime; /* display all stop watch control buttons */ 
        var showStart = document.getElementById ('start'); 
        showStart.style.display = "inline-block"; 
        var showStop = document.getElementById ("stop"); 
        showStop.style.display = "inline-block"; /* clear the stop watch using the setTimeout( ) return value 'clearTime' as ID */ 
        clearTimeout( clearTime ); 
    } // if () 
} // stopTime() /* you need to call the stopTime( ) function to terminate the stop watch */ 
window.addEventListener( 'load', function ( ) { 
    var stop = document.getElementById ("stop"); 
    stop.addEventListener( 'click', stopTime ); 
}); // stopwatch.js end 
window.addEventListener( 'load', function ( ) { 
    var start = document .getElementById("start"); 
    start.addEventListener( 'click', startTime ); 
}); // startwatch.js end 



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

function configureTexture1( image ) {
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

var texture2;
function configureTexture2( image ) {
    texture2 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
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
var flag = true;
var numMaze;
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
    


    var image1 = document.getElementById("ground");
    configureTexture1( image1 );

    var image2 = document.getElementById("bricks");
    configureTexture2( image2 );

    /*var image2 = document.getElementById("bricks");
    configureTexture( image2 );*/
    

    
    projectionMatrix = mat4();
    projectionMatrixLoc = gl.getUniformLocation(program, "projection");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    modelMatrix = mat4();
    modelMatrixLoc = gl.getUniformLocation(program, "model");
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));

    thetaLoc = gl.getUniformLocation(program, "theta");

    drawSurface();

    var mazes = [MAZE1, MAZE2, MAZE3];
    numMaze = Math.floor(Math.random() * mazes.length);
    createMaze(mazes[numMaze]);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
    
    gl.uniform1f(gl.getUniformLocation(program,"shininess"),materialShininess);

    //event listeners for buttons

    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup", mouseUp, false);
    canvas.addEventListener("mouseout", mouseUp, false);
    canvas.addEventListener("mousemove", mouseMove, false);

    window.addEventListener("keydown", function(e) {
        // space and arrow keys
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);

    
    
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
            case 'v':
                topView();
                break;
            case 'b':
                regView();
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
            case 16:
                if(flag){
                    topView();
                    flag = false;
                }
                else{
                    regView();
                    flag=true;
                }
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

var startingTranslation;
var endingTranslation;
var createMaze = function(maze){
    var blockUnit = 1;
    var width = size*100-5; // Width of surface
    var height = size*100-5; // Length of surface

    var starter = startEnd[numMaze][0];
    var ender = startEnd[numMaze][1];

    for(var i=0;i<maze.length;i++){
        for(var j=0;j<maze[i].length;j++){
            //console.log(j,i)
            //wallTranslations.push(translate((height-blockSize-(blockSize*(i*2))),blockSize+size,blockSize-size))
            if(i == starter[0] && j==starter[1]){
                //console.log('Beginning at:',j,',',i);
                startingTranslation = translate(height-blockSize-(blockSize*i*2),blockSize+size,width-blockSize-(j*2*blockSize));
            }
            if(i == ender[0] && j==ender[1]){
                //console.log('Ending at:',j,',',i);
                endingTranslation = translate(height-blockSize-(blockSize*i*2),blockSize+size,width-blockSize-(j*2*blockSize));
            }
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
    quad( 1, 0, 3, 2, 8 ); // Black face
    quad( 2, 3, 7, 6, 8 ); // Red face
    quad( 3, 0, 4, 7, 8 ); // Yellow face
    quad( 6, 5, 1, 2, 8 ); // Green face
    quad( 4, 5, 6, 7, 8); // Blue
    quad( 5, 4, 0, 1, 8 ); // Magenta

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

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
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
var curAngle2 = 0;
var cam1=0,cam2=0,cam3=0;
var collisionExists;
var collisionPoints;
var lastPressed;
function executeW(){
    
    
    //cam1 -= camSpeed;
    //cam2 += camSpeed;
    //cam3 += camSpeed;

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
function executeUp(){
    curAngle2+=rotAngle
}
function executeDown(){
    curAngle2-=rotAngle
}

var prevCams = [0,0,0,0,0];
function topView(){
    prevCams[0] = cam1;
    prevCams[1] = cam2;
    prevCams[2] = cam3;
    prevCams[3] = curAngle2;
    prevCams[4] = curAngle;
    cam1 = -23; // up/down
    cam2 = -42; // In/out
    cam3 = -15;
    curAngle2 = -85;
    curAngle = 0;

}
function regView(){
    
    cam1 = prevCams[0];
    cam2 = prevCams[1];
    cam3 = prevCams[2];
    curAngle2 = prevCams[3];
    curAngle = prevCams[4];
    
    //console.log(curAngle2)
}

var startPoint,endPoint;
function checkStartTimer(){
    var center = mat4(0);

    //(length(subtract(startPoint,center)));
    
    if(length(subtract(startPoint,center))<hitDistance){
        console.log('Start');
        startTime();
    }
    if(length(subtract(endPoint,center))<hitDistance){
        console.log('End');
        stopTime();
    }

    /*collisionExists = false;
    for(var i=0;i<points.length;i++){
        var dist = length(subtract(points[i],center));
        if(dist<hitDistance){
            collisionExists = true;
            //console.log('Collision Distance: ',dist);
            curCollisionDist = dist;
        }
    }*/
}

function moveCamera(){
    modelMatrix = mult(modelMatrix,rotateZ(curAngle2));
    modelMatrix = mult(modelMatrix,rotateY(curAngle));
    
    modelMatrix = mult(modelMatrix,translate(cam1, cam2, cam3));
    

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
    checkStartTimer();
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

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

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
    

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    
    startPoint = mult(modelMatrix,startingTranslation);
    endPoint = mult(modelMatrix,endingTranslation);
    
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
