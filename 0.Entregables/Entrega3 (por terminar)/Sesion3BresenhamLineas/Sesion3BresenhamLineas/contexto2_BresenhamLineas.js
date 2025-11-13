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

/** *******************************************************
* Dibuja un pixel en las coordenadas WEBGL  que le envian
* ********************************************************/
function dibujaPixel(x, y) {

  console.log(x,y);

  var xp = x/parseFloat(canvas.width);
  var yp = y/parseFloat(canvas.height);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([xp, yp,]), gl.STATIC_DRAW);
  
  gl.drawArrays(gl.POINTS, 0, 1);
}


/** **************************************************************
* ALgoritmo de Bresenham para líneas. Utiliza enteros, asi que 
* tomaremos como coordenadas iniciales los que el canvas detectaría, es decir, valores de
* [-300,300] porque son enteros, y luego lo pinta transformado al espacio WebGL [-1,+1].
** ***********************************************************/
function bresenLinea(xI, yI, xF, yF){

    //Valores de diferencia, pendientes y error
    var dx = Math.abs(xF - xI);
    var dy = Math.abs(yF - yI);

    // Valores de pendiente
    var sx = (xI < xF) ? 1 : -1;
    var sy = (yI < yF) ? 1 : -1;

    //Valor de error
    var err = dx - dy;

    

    dibujaPixel(xI, yI);


    //Bucle de pintado de pixel tras pixel
  
      while  (!((xI==xF)&&(yI==yF))){
      var e2 = err << 1;

      if (e2 > -dy) {
        err -= dy;
        xI += sx;
       }
      if (e2 < dx) {
        err += dx;
        yI += sy;
       }

     dibujaPixel(xI, yI);
     }
 
}


/** *************************************************
	initBuffer_Draw(): Enlazar los bufferes a los vértices declarados
	
 ****************************************************/


function initBuffer_Draw(){

	/**
	* Posicion inicial y final del segmento
	* Cuidado que estoy utilizando coordenadas enteras
	**/
	var xIni =-100, yIni=-100;
	var xFin =350, yFin=100;


	/**
	* POSICION
	*/

	glProgram.vertexPositionAttribute= gl.getAttribLocation(glProgram, "aVertexPosition");


     // Crear a buffer y enlaza.
     buff = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, buff);


	//Habilitamos el atributo: queremos proporcionar los datos de la posicion desde un buffer
	gl.enableVertexAttribArray(glProgram.vertexPositionAttribute);
	gl.vertexAttribPointer(glProgram.vertexPositionAttribute,2, gl.FLOAT,false,0,0);

	//BRESENHAM QUE PINTE LINEA
	bresenLinea(xIni, yIni, xFin, yFin);

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
		alert ("Webgl2 no esta disponible");
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
			
