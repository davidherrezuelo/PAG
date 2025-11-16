
var gl;
var canvas;
var program;
var myphi = 0, zeta = 30, radius = 33, fovy = 0.034;
var time = 0.0;

function getWebGLContext() {
  
  canvas = document.getElementById("myCanvas");
  
  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  
  for (var i = 0; i < names.length; ++i) {
    try {
      return canvas.getContext(names[i]);
    }
    catch(e) {
    }
  }
  
  return null;
  
}

function initShaders() { 
  
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, document.getElementById("myVertexShader").text);
  gl.compileShader(vertexShader);
  
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		alert("Error de compilación del vertexshader: " + gl.getShaderInfoLog(vertexShader));     
	}

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, document.getElementById("myFragmentShader").text);
  gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		alert("Error de compilación del fragshader: " + gl.getShaderInfoLog(fragmentShader));     
	}
  
  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  
  gl.linkProgram(program);
  
  gl.useProgram(program);
  
  program.vertexPositionAttribute = gl.getAttribLocation( program, "VertexPos");
  gl.enableVertexAttribArray(program.vertexVelocityAttribute); 

  program.vertexVelocityAttribute = gl.getAttribLocation( program, "VertexVelocity");
  gl.enableVertexAttribArray(program.vertexVelocityAttribute);

  program.vertexAccelerationAttribute = gl.getAttribLocation( program, "VertexAcceleration");
  gl.enableVertexAttribArray(program.vertexVelocityAttribute);
  
  program.vertexStartTimeAttribute = gl.getAttribLocation( program, "VertexStartTime");
  gl.enableVertexAttribArray(program.vertexStartTimeAttribute);
  
  program.modelViewMatrixIndex  = gl.getUniformLocation( program, "modelViewMatrix");
  program.projectionMatrixIndex = gl.getUniformLocation( program, "projectionMatrix");
  
  program.TiempoIndex           = gl.getUniformLocation( program, "Time");
  gl.uniform1f (program.TiempoIndex,0.0);

  	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		   alert("No se puede inicializar el Programa .");
		  }
}

function initRendering() {
  
  gl.clearColor(0.02,0.02,0.1,1.0);
  gl.disable   (gl.DEPTH_TEST);
  gl.enable    (gl.BLEND);
  gl.blendFunc (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

}

var nParticles    = 10000;

function initParticleSystem() {
  var particleData = [];
  
  for (var i= 0; i < nParticles; i++) {
    
    // angulos del cono
    var theta = Math.PI / 6.0 * Math.random();
    var phi   = 2.0 * Math.PI * Math.random();

    // posicion inicial
    var x = 0.0;
    var y = 0.5;
    var z = 0.0;
    
    // direccion
    var dx = Math.sin(theta) * Math.cos(phi);
    var dy = Math.cos(theta);
    var dz = Math.sin(theta) * Math.sin(phi);
    
    // velocidad
    var alpha = Math.random();
    var velocity = (1.25 * alpha) + (1.50 * (1.0 - alpha));

    // aceleración
    var ax = 0.0;
    var ay = 0.0;
    var az = 0.0;
    particleData[i * 10 + 0] = x;
    particleData[i * 10 + 1] = y;
    particleData[i * 10 + 2] = z;
    particleData[i * 10 + 3] = dx * velocity;
    particleData[i * 10 + 4] = dy * velocity;
    particleData[i * 10 + 5] = dz * velocity;
    particleData[i * 10 + 6] = az;
    particleData[i * 10 + 7] = ay;
    particleData[i * 10 + 8] = ax;
    particleData[i * 10 + 9] = i * 0.00075;  // instante de nacimiento - mas factor quiere decir menos densidad de particulas.
  }

  program.idBufferVertices = gl.createBuffer ();
  gl.bindBuffer (gl.ARRAY_BUFFER, program.idBufferVertices);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(particleData), gl.STATIC_DRAW);
  
}

function setProjection() {

  var projectionMatrix  = mat4.create();
  mat4.perspective(projectionMatrix, fovy, 1, 0.1, 100);
  gl.uniformMatrix4fv(program.projectionMatrixIndex,false,projectionMatrix);
  
}

function getCameraMatrix() {
  
  var _phi  = myphi* Math.PI / 180.0;
  var _zeta = zeta * Math.PI / 180.0;
  
  var x = 0, y = 0, z = 0;
  z = radius * Math.cos(_zeta) * Math.cos(_phi);
  x = radius * Math.cos(_zeta) * Math.sin(_phi);
  y = radius * Math.sin(_zeta);
  
  var cameraMatrix = mat4.create();
  mat4.lookAt(cameraMatrix, [x, y, z], [0, 0.5, 0], [0, 1, 0]);
  
  return cameraMatrix;
  
}

function drawParticleSystem() {
  
  gl.bindBuffer (gl.ARRAY_BUFFER, program.idBufferVertices);
  gl.vertexAttribPointer (program.vertexPositionAttribute,      3, gl.FLOAT, false, 10*4,   0  );
  gl.vertexAttribPointer (program.vertexVelocityAttribute,      3, gl.FLOAT, false, 10*4,   3*4);
  gl.vertexAttribPointer (program.vertexAccelerationAttribute,  3, gl.FLOAT, false, 10*4,   6*4);
  gl.vertexAttribPointer (program.vertexStartTimeAttribute,     1, gl.FLOAT, false, 10*4,   9*4);
  
  gl.drawArrays (gl.POINTS, 0, nParticles);
  
}

function drawObjects() {

  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, getCameraMatrix());
  drawParticleSystem();
  
}

function updateTime(){
  
  time += 0.01;
  gl.uniform1f (program.TiempoIndex, time);

  if (time > 8.5)
    time = 0.0;

  requestAnimationFrame(drawScene);

}

function drawScene() {
  
  setProjection();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  drawObjects();
  
}

function initHandlers() {
  
  var mouseDown = false;
  var lastMouseX;
  var lastMouseY;
  
  canvas.addEventListener("mousedown",
                          function(event) {
                          mouseDown  = true;
                          lastMouseX = event.clientX;
                          lastMouseY = event.clientY;
                          },
                          false);
  
  canvas.addEventListener("mouseup",
                          function() {
                          mouseDown           = false;
                          },
                          false);
  
  canvas.addEventListener("mousemove",
                          function (event) {
                          if (!mouseDown) {
                            return;
                          }
                          var newX = event.clientX;
                          var newY = event.clientY;
                          if (event.shiftKey == 1) {
                          if (event.altKey == 1) {              // fovy
                          fovy -= (newY - lastMouseY) / 100.0;
                          if (fovy < 0.001) {
                          fovy = 0.1;
                          }
                          } else {                              // radius
                          radius -= (newY - lastMouseY) / 10.0;
                          if (radius < 0.01) {
                          radius = 0.01;
                          }
                          }
                          } else {                               // position
                          myphi -= (newX - lastMouseX);
                          zeta  += (newY - lastMouseY);
                          if (zeta < -80) {
                          zeta = -80.0;
                          }
                          if (zeta > 80) {
                          zeta = 80;
                          }
                          }
                          lastMouseX = newX
                          lastMouseY = newY;
                          requestAnimationFrame(drawScene);
                          },
                          false);

}

function initWebGL() {
  
  gl = getWebGLContext();
  
  if (!gl) {
    alert("WebGL no está disponible");
    return;
  }
  
  initShaders();
  initParticleSystem();
  initRendering();
  initHandlers();

  setInterval(updateTime, 40);
  
}

initWebGL();
