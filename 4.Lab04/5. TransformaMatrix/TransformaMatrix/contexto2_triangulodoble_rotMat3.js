// Funcionalidad Javascript 
// Funciones generales de webgl
/** *************************************
   VARIABLES GLOBALES
*****************************************/
 var canvas=null; // variable que identifica el canvas donde se pinta
 var gl =null; // variable contexto webgl2 de la aplicación
 
 var vertexShader,fragmentShader, glProgram;

// Los datos de los vertices
var model = [ 
    //Triangulo Izquierdo
          -0.5, 0.5,
           0.0, 0.0,
          -0.5, -0.5,
     //Triangulo derecho
          0.5, 0.5,
           0.0, 0.0,
          0.5, -0.5,                              
    ];

// Los colores de cada vértice
var colores = [ 
          //Triangulo Izquierdo Rojo
           1.0, 0.0, 0.0,
           1.0, 1.0, 0.0,
           1.0, 0.0, 0.0,
        
          //Triangulo Derecho Azul
          0.0, 0.0, 1.0,
           1.0, 0.7, 1.0,
          0.0, 0.0, 1.0,
        ];

var vertexBuf, colorBuf;

var angle=60;

/****************/
/** FUNCIONES **/
/****************/

/** *************************************************
	initBuffers: iniciar los Bufferes
	En esta función crearemos el buffer de vértices y el buffer de índices
 ****************************************************/

function initBuffers(){
	//Buffer Vertices
	vertexBuf=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(model),gl.STATIC_DRAW);
	
	//Buffer Colores
	colorBuf=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colores),gl.STATIC_DRAW);
	

}

/** *************************************************
	draw (model): Enlazar los bufferes a los vértices declarados
	
 ****************************************************/
function draw(){

	/**
	* POSICION
	*/

	glProgram.vertexPositionAttribute= gl.getAttribLocation(glProgram, "aVertexPosition");

	//Habilitamos el atributo: queremos proporcionar los datos de la posicion desde un buffer
	gl.enableVertexAttribArray(glProgram.vertexPositionAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
	gl.vertexAttribPointer(glProgram.vertexPositionAttribute,2, gl.FLOAT,false,0,0);

	//*
	//COLORES
	//*
	glProgram.vertexColorAttribute= gl.getAttribLocation(glProgram, "aVertexColor");

	//Habilitamos el atributo: queremos proporcionar los datos de la posicion desde un buffer
	gl.enableVertexAttribArray(glProgram.vertexColorAttribute);
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf);
	gl.vertexAttribPointer(glProgram.vertexColorAttribute,3, gl.FLOAT,false,0,0);

	/*
	** CALCULO DE LA ROTACION 
	*/
	var radian = Math.PI * angle / 180.0; // Convert to radians

    //Creo una matriz con GLMatrix
    var Matrix = mat4.create();

    mat4.fromRotation(Matrix,radian,[0,0,1]);



    //Localiza la variable en el programa
    glProgram.uMatrix = gl.getUniformLocation(glProgram, "uMatrix");
    
    //Pasamos los valores
    gl.uniformMatrix4fv(glProgram.uMatrix, false,Matrix);
    
	//DIBUJO
	//Dibuja el tipo de primitiva, desde qué elemento comienza y cuantos dibuja
	gl.drawArrays(gl.TRIANGLES, 0, 6);


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
		initBuffers();
		draw();

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
	gl.clearColor(1.0,1.0,1.0,1.0);

	// rellena el buffer de color con el color indicado por clearColor
	// y pintalo
	gl.clear(gl.COLOR_BUFFER_BIT);	

	//Crea un viewport del tamaño del canvas
	gl.viewport(0, 0, canvas.width, canvas.height);
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
	

	
