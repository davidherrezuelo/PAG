// Funcionalidad Javascript 
// Funciones generales de webgl
/** *************************************
   VARIABLES GLOBALES
*****************************************/
 var canvas=null; // variable que identifica el canvas donde se pinta
 var gl =null; // variable contexto webgl2 de la aplicación
 
 var vertexShader,fragmentShader, glProgram;

//Bufferes
var buff;


/****************/
/** FUNCIONES **/
/****************/
/**
*Devuelve un entero aleatorio entre -1 y +1
*/

function randomSpace(){
  return ((Math.random()*2)-1);
}



/**
* Envía al bufferData de las posiciones de los vértices, las coordenadas de un 
* nuevo punto
* 
* @param: x,y coordenadas de un nuevo punto
*/
function setRombos(x, y) {
  
  //var x1 = x;
  //var y1 = y;
  diagonal1=randomSpace();
  diagonal2=randomSpace();

  x1=x+(0.05+diagonal1/40); //Norte
  y1=y;

  x2=x; //Este
  y2=y+(0.05+diagonal2/40);

  x3=x-(0.05+diagonal1/40); //Sur
  y3=y;

  x4=x; //Oeste
  y4=y-(0.05+diagonal2/40);

  // snippet creado con ChatGPT desde AQUÍ para rotar los puntos exteriores alrededor del centro y dar mas aleatoriedad
  const angleRad = Math.PI * randomSpace();
  const c = Math.cos(angleRad), s = Math.sin(angleRad);
  
  let dx, dy, rx, ry;

  dx = x1 - x; dy = y1 - y; rx = x + dx * c - dy * s; ry = y + dx * s + dy * c; x1 = rx; y1 = ry;
  dx = x2 - x; dy = y2 - y; rx = x + dx * c - dy * s; ry = y + dx * s + dy * c; x2 = rx; y2 = ry;
  dx = x3 - x; dy = y3 - y; rx = x + dx * c - dy * s; ry = y + dx * s + dy * c; x3 = rx; y3 = ry;
  dx = x4 - x; dy = y4 - y; rx = x + dx * c - dy * s; ry = y + dx * s + dy * c; x4 = rx; y4 = ry;

  // snippet creado con ChatGPT hasta AQUÍ

  var vertexVec = [
		x,  y,
		x1, y1, 
		x2, y2, 
		x3, y3, 
		x4, y4, 
		x1, y1,
  ];
 

  //console.log(x,y); // tipica instrucción para ver si todo va bien

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x, y, x1, y1, x2, y2, x3, y3, x4, y4, x1, y1]), gl.STATIC_DRAW);
}



/** *************************************************
	initBuffer_Draw(): Enlazar los bufferes a los vértices declarados
	
 ****************************************************/


function initBuffer_Draw(){

	/**
	* POSICION
	*/

	glProgram.vertexPositionAttribute= gl.getAttribLocation(glProgram, "aVertexPosition");

	//COLORES
	glProgram.vertexColorUniform= gl.getUniformLocation(glProgram, "colorUniform");

     // Crear a buffer y enlaza.
     buff = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, buff);


	//Habilitamos el atributo: queremos proporcionar los datos de la posicion desde un buffer
	gl.enableVertexAttribArray(glProgram.vertexPositionAttribute);
	gl.vertexAttribPointer(glProgram.vertexPositionAttribute,2, gl.FLOAT,false,0,0);


	/*
    * Dibuja 150 puntos en posiciones aleatorias 
    * con colores aleatorios
    */
    for (var ii = 0; ii < 200; ++ii) {
      //Coordenadas aleatorias de un punto	
		
    	setRombos(randomSpace(), randomSpace());

        //Almaceno en la variable uniform un color aleatorio
        gl.uniform4f(glProgram.vertexColorUniform, Math.random(), Math.random(), Math.random(), 1);

        //Dibuja UN punto
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 6);	
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
		initBuffer_Draw();

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
			
