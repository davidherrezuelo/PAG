// Funcionalidad Javascript 
// Funciones generales de webgl
/** *************************************
   VARIABLES GLOBALES
*****************************************/
 var canvas=null; // variable que identifica el canvas donde se pinta
 var gl =null; // variable contexto webgl2 de la aplicación
 
 var vertexShader,fragmentShader, glProgram;	

 var ratonAbajo = false;
 var posRatonX, posRatonY;
 

 var ViewMatrix = mat4.create();
 var ProjectionMatrix = mat4.create();

// Los datos de los vertices

var camState = {	
    fov: 60.0,
    znear: 0.1,
    zfar: 10.0,
    pos: [0,0.1,-2],
    look: [0,0,0]
  };

var model = {
    "vertices" : [
		-0.1, -0.3, 0,
		0.1, -0.3, 0,
		0.0, 0.3, 0,
	],

	"colores" : [
    [1.0, 0.2, 0.2],
    [1.0, 0.2, 0.2],  
    [0.2, 1.0, 0.4],
	[0.2, 1.0, 0.4],  
    [0.2, 0.4, 1.0],
	[0.2, 0.4, 1.0],  
    [1.0, 0.8, 0.2],
	[1.0, 0.8, 0.2],  
	[0.3, 0.9, 0.9],
	[0.3, 0.9, 0.9],
	],
    // indices para gl.LINES
    "indices_lines" : [
	],
     // indices para gl.TRIANGLE_FAN
    "indices_bases" : [
	],
	"indices_lados" : [
	],
	"translateXYZ" : [
		[0.5, 0.3, 0], 
		[-0.5, 0.3, 0], 
		[0.5, 0.3, 1], 
		[-0.5, 0.3, 1], 
		[0.5, 0.3, 2], 
		[-0.5, 0.3, 2], 
		[0.5, 0.3, 3], 
		[-0.5, 0.3, 3], 
	],
}

var angle = 0;
/****************/
/** FUNCIONES **/
/****************/
function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

function detectValues(){
  const EPS = 1e-4;
  const fovSlider   = document.getElementById('fov');
  const znearSlider = document.getElementById('znear');
  const zfarSlider  = document.getElementById('zfar');
  const posInput    = document.getElementById('posCam');
  const lookInput   = document.getElementById('lookAt');

  const fovVal   = document.getElementById('fovVal');
  const znearVal = document.getElementById('znearVal');
  const zfarVal  = document.getElementById('zfarVal');

  fovSlider.addEventListener('input', (e) => {
    fovVal.textContent = e.target.value;
	camState.fov=parseFloat(e.target.value);
//    console.log('FoV:', e.target.value);
  });

  znearSlider.addEventListener('input', (e) => {
    znearVal.textContent = e.target.value;
	camState.znear=parseFloat(e.target.value);
//    console.log('zNear:', e.target.value);
  });

  zfarSlider.addEventListener('input', (e) => {
    zfarVal.textContent = e.target.value;
	camState.zfar=parseFloat(e.target.value);
//    console.log('zFar:', e.target.value);
  });

  posInput.addEventListener('change', (e) => {
	camState.pos = e.target.value.split(',').map(s => Number(s.trim()));
//    console.log('Camera position:', e.target.value);
  });

  lookInput.addEventListener('change', (e) => {
	camState.look = e.target.value.split(',').map(s => Number(s.trim()));
//    console.log('LookAt:', e.target.value);
  });
}


function detectMouse(){


    //EVENTO: pushMouseDown *********************
  
   canvas.addEventListener("mousedown", event=>{
      
       // console.log(1);
        ratonAbajo = true;
        posRatonX = event.clientX;
        posRatonY = event.clientY;

        //console.log(posRatonX, posRatonY);
      });

 //EVENTO: pushMouseUp *********************
    window.addEventListener("mouseup", event=>{
      //console.log(2);
        ratonAbajo = false;
       });

 //EVENTO: pushMouseUp *********************
    window.addEventListener("mousemove",event=>{
        
        //console.log(3);
        if (!ratonAbajo) {
            return;
        }
      

        var nuevaX = event.clientX;
        var nuevaY = event.clientY;

        console.log(nuevaX, nuevaY);

        var deltaX = -nuevaX + posRatonX;
        var deltaY = -nuevaY + posRatonY;

        var idMatrix=mat4.create();
        mat4.fromRotation(idMatrix,degToRad(deltaX/2), [0,1,0]);
        mat4.rotate(idMatrix,idMatrix,degToRad(deltaY/2), [1,0,0]);
        
        mat4.multiply(model.Matrix,idMatrix,model.Matrix);

        posRatonX = nuevaX;
        posRatonY = nuevaY;
       });
  }

/** *************************************************
	initBuffers: iniciar los Bufferes
	En esta función crearemos el buffer de vértices y el buffer de índices
 ****************************************************/

function initBuffers(){
  //Buffer Vertices
  console.log("initBuffers, model es:", model);
  model.idBufferVertices = gl.createBuffer();
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.DYNAMIC_DRAW);
  
}


/** *************************************************
	draw (model): Enlazar los bufferes a los vértices declarados
	
 ****************************************************/
function draw(){
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(glProgram);

	
	// view matrix

	mat4.lookAt(ViewMatrix, camState.pos, camState.look, [0,1,0]);
	glProgram.uMatrix = gl.getUniformLocation(glProgram, "uViewMatrix");
	gl.uniformMatrix4fv(glProgram.uMatrix, false, ViewMatrix);
	

	// persp matrix
	const fovY = degToRad(Number(camState.fov));
	mat4.perspective(ProjectionMatrix, fovY, canvas.width/canvas.height, camState.znear, camState.zfar);

	glProgram.uMatrix = gl.getUniformLocation(glProgram, "uProjectMatrix");
	gl.uniformMatrix4fv(glProgram.uMatrix, false, ProjectionMatrix);

	//far y near plane

	glProgram.uFloat = gl.getUniformLocation(glProgram, "uNear");
	gl.uniform1f(glProgram.uFloat, Number(camState.znear));

	glProgram.uFloat = gl.getUniformLocation(glProgram, "uFar");
	gl.uniform1f(glProgram.uFloat, Number(camState.zfar));
	
	/**
	* POSICION (y modelMatrix)
	*/
	for(let i=0; i<8; i++){
		glProgram.colorTriangulo = gl.getUniformLocation(glProgram,"uColor");
		gl.uniform3f(glProgram.colorTriangulo, model.colores[i][0],model.colores[i][1],model.colores[i][2]);
		
		tempMatrix = mat4.create();
		mat4.translate(tempMatrix, tempMatrix, model.translateXYZ[i])
		glProgram.uMatrix=gl.getUniformLocation(glProgram,"uModelMatrix");
		gl.uniformMatrix4fv(glProgram.uMatrix, false, tempMatrix);

		glProgram.vertexPositionAttribute= gl.getAttribLocation(glProgram, "aVertexPosition");
		//Habilitamos el atributo: queremos proporcionar los datos de la posicion desde un buffer
		gl.enableVertexAttribArray(glProgram.vertexPositionAttribute);

		gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
		gl.vertexAttribPointer(glProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLES, 0, model.vertices.length/3);
	}


}
/** *************************************************
 ==> Identifica el canvas y su contexto de webgl2
 ****************************************************/
function initWebGL(){
	/**
	Identificar el canvas y probar si admite el navegador webgl
	*/
	canvas=document.getElementById("canvas");
	
	 /** Obtener el contexto GL**/
	gl=canvas.getContext("webgl2");
	
	if (gl){
		// Funciones a ejecutar
		setupWebGL();
		initShaders();
		//detectMouse();
		detectValues();
		initBuffers();            
		(function animLoop(){
            setupWebGL();
            draw();
			angle+=1;
            requestAnimationFrame(animLoop, canvas);
          })();

		

	}	
	else{	
		alert ("webgl2 no esta disponible");
	}

}

/******************************************************
Limpia el buffer de color y configura el viewport
*******************************************************/

function setupWebGL()
{
	//Color de fondo del contexto
	// -- son RGB - canal alpha que define la opacidad de un pixel. 
	//                    1.0 opaco
	// Para qué sirve el canal alpha?-- para trabajar en capas
	gl.clearColor(0.95,0.95,0.95,1.0);
  	gl.lineWidth(1.5);

	// rellena el buffer de color con el color indicado por clearColor
	// y pintalo
	gl.clear(gl.COLOR_BUFFER_BIT);	

	//Crea un viewport del tamaño del canvas
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.disable(gl.CULL_FACE)
}

/******************************************************
Compila cada uno de los shaders, los linka y obtiene una referencia
al programa con los shaders añadidos y compilados
*******************************************************/

function initShaders()
{
 // Esta función inicializa los shaders
			 
//1.Obtengo la referencia de los shaders 
	var fs_source = document.getElementById('shader-fs').innerHTML;
	var vs_source = document.getElementById('shader-vs').innerHTML;        
//2. Compila los shaders	
	vertexShader = makeShader(vs_source, gl.VERTEX_SHADER);
	fragmentShader = makeShader(fs_source, gl.FRAGMENT_SHADER);
		
//3. Crea un programa
	glProgram = gl.createProgram();
				
//4. Adjunta al programa cada shader
  gl.attachShader(glProgram, vertexShader);
  gl.attachShader(glProgram, fragmentShader);
  gl.linkProgram(glProgram);

	if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
		   alert("No se puede inicializar el Programa .");
		  }
			
//5. Usa el programa
	gl.useProgram(glProgram);
}

/******************************************************
Crea cada shader y lo compila
*******************************************************/
				
function makeShader(src, type)
	{
	//COMPILAMOS EL VS
	var shader = gl.createShader(type);
	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("Error de compilación del shader: " + gl.getShaderInfoLog(shader));     
		}
		return shader;
	}
			
