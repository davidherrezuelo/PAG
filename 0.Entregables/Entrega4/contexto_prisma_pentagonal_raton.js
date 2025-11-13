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
 var Matrix = mat4.create();

// Los datos de los vertices
var model = {
    "vertices" : [
		 0.50000,  0.5,  0.0000, 
		 0.15450,  0.5,  0.4755, 
		 -0.4045,  0.5,  0.2939, 
		 -0.4045,  0.5, -0.2939, 
		 0.15450,  0.5, -0.4755, 
 
		 0.50000, -0.5,  0.0000, 
		 0.15450, -0.5,  0.4755, 
		 -0.4045, -0.5,  0.2939, 
		 -0.4045, -0.5, -0.2939, 
		 0.15450, -0.5, -0.4755, 
	],

	"colores" : [
		1,0,0,
		0,1,0,
		0,0,1,
		0,1,1,
		1,0,1,
		1,1,0,
		1,0,0.5
	],
    // indices para gl.LINES
    "indices_lines" : [
		0,1, 1,2, 2,3, 3,4, 4,0,
		0,5, 1,6, 2,7, 3,8, 4,9,
		5,6, 6,7, 7,8, 8,9, 9,5,
	],
     // indices para gl.TRIANGLE_FAN
    "indices_bases" : [
		0,1,2,3,4,
		9,8,7,6,5,
	],
	"indices_lados" : [
		1,0,5,6,
		2,1,6,7,
		3,2,7,8,
		4,3,8,9,
		0,4,9,5,
	]
}

var angle = 0;
/****************/
/** FUNCIONES **/
/****************/
function degToRad(degrees) {
	return degrees * Math.PI / 180;
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
        
        mat4.multiply(Matrix,idMatrix,Matrix);

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
  model.idBufferVertices = gl.createBuffer();
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.DYNAMIC_DRAW);
  
  //Buffer de Indices a vértices
  model.idBufferIndicesBases = gl.createBuffer();
  gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndicesBases);
  gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices_bases), gl.DYNAMIC_DRAW);

  model.idBufferIndicesLados = gl.createBuffer();
  gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndicesLados);
  gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices_lados), gl.DYNAMIC_DRAW);

  model.idBufferIndicesLineas = gl.createBuffer();
  gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndicesLineas);
  gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices_lines), gl.DYNAMIC_DRAW);
  
}


/** *************************************************
	draw (model): Enlazar los bufferes a los vértices declarados
	
 ****************************************************/
function draw(){
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(glProgram);
	gl.colorTriangulo = gl.getUniformLocation(glProgram,"uColor");


//	var radian = Math.PI * angle / 180.0; // Convert to radians
//
//    //Creo una matriz con GLMatrix3
//    
//
//    mat4.fromRotation(Matrix,radian,[0.5,1,0.5]);
//
//
//
//    //Localiza la variable en el programa
glProgram.uMatrix = gl.getUniformLocation(glProgram, "uMatrix");
//    
//    //Pasamos los valores
gl.uniformMatrix4fv(glProgram.uMatrix, false, Matrix);
	



	/**
	* POSICION
	*/

	glProgram.vertexPositionAttribute= gl.getAttribLocation(glProgram, "aVertexPosition");

	//Habilitamos el atributo: queremos proporcionar los datos de la posicion desde un buffer
	gl.enableVertexAttribArray(glProgram.vertexPositionAttribute);

	gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
  	gl.vertexAttribPointer(glProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.POINTS, 0, model.vertices.length/3);


	/**
	 * COLOR
	 */

//	glProgram.vertexColorAttribute = gl.getAttribLocation(glProgram, "aVertexColor");
//	gl.enableVertexAttribArray(glProgram.vertexColorAttribute);
//
//	gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferColores);
//	gl.vertexAttribPointer(glProgram.vertexColorAttribute, 3, gl.FLOAT, false, 0, 0);

	//Para bases
	for(let i=0; i<2; i++){
		
		gl.uniform3f(gl.colorTriangulo, model.colores[3*i], model.colores[3*i+1], model.colores[3*i+2]);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndicesBases);
		gl.drawElements (gl.TRIANGLE_FAN, 5, gl.UNSIGNED_SHORT, i*2*5);
	}

	for(let i=0; i<5; i++){
		
		gl.uniform3f(gl.colorTriangulo, model.colores[6+3*i], model.colores[6+3*i+1], model.colores[6+3*i+2]);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndicesLados);
		gl.drawElements (gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, i*2*4);
	}
//
	gl.uniform3f(gl.colorTriangulo, 0.0, 0.0, 0.0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndicesLineas);
  	gl.drawElements (gl.LINES, model.indices_lines.length, gl.UNSIGNED_SHORT, 0);
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
		detectMouse();
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
	gl.enable(gl.CULL_FACE)
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
			
