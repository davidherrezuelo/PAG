		// Funcionalidad Javascript 
// Funciones generales de webgl
/** *************************************
   VARIABLES GLOBALES
*****************************************/
 var canvas=null; // variable que identifica el canvas donde se pinta
 var gl =null; // variable contexto webgl2 de la aplicación
 
 var vertexShader,fragmentShader, glProgram;

 const triangulo ={}

triangulo.vertices = [
   -0.5,  0.5, 0,
   -0.5, -0.5, 0,
	0, 0, 0,
	0.5,  0.5, 0,
   	0.5, -0.5, 0,
	0, 0, 0
];

triangulo.colores = [
	1,  0, 0,
    1,  0, 0,
	1, 1, 0,
	0,  0, 1,
    0,  0, 1,
	1, 0.9, 0.9
]

const deg = 45;
const rad = deg * Math.PI / 180;
const c = Math.cos(rad);
const s = Math.sin(rad);






/****************/
/** FUNCIONES **/
/****************/
/** *************************************************
	initBuffers: iniciar los Bufferes
	En esta función crearemos el buffer de vértices y el buffer de índices
 ****************************************************/
function initBuffers(model){
	const u_cos = gl.getUniformLocation(glProgram, "u_cos");
	const u_sin = gl.getUniformLocation(glProgram, "u_sin");
	const u_t   = gl.getUniformLocation(glProgram, "u_t");
	gl.uniform1f(u_cos, c);
	gl.uniform1f(u_sin, s);
	gl.uniform2f(u_t, 0.0, 0.0);
	
	//Buffer de vertices
	model.bufferVertices=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, model.bufferVertices);
		//gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(model.vertices),gl.STATIC_DRAW);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(model.vertices),gl.STATIC_DRAW);

	//Buffer de vertices
	model.bufferColores=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, model.bufferColores);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.colores),gl.STATIC_DRAW);

}

/** *************************************************
	draw (model): Enlazar los bufferes a los vértices declarados
	
 ****************************************************/
function draw(model){
	

	glProgram.vertexPositionAttribute= gl.getAttribLocation(glProgram, "aVertexPosition");

	gl.bindBuffer(gl.ARRAY_BUFFER, model.bufferVertices);
	gl.enableVertexAttribArray(glProgram.vertexPositionAttribute);
	gl.vertexAttribPointer(glProgram.vertexPositionAttribute,3, gl.FLOAT,false,0,0);


	glProgram.vertexColorAttribute= gl.getAttribLocation(glProgram, "aVertexColor");

	gl.bindBuffer(gl.ARRAY_BUFFER, model.bufferColores);
	gl.enableVertexAttribArray(glProgram.vertexColorAttribute);
	gl.vertexAttribPointer(glProgram.vertexColorAttribute,3, gl.FLOAT,false,0,0);

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
		initBuffers(triangulo);
		draw(triangulo);

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





