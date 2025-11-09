// Funcionalidad Javascript 
// Funciones generales de webgl
/** *************************************
   VARIABLES GLOBALES
*****************************************/
 var canvas=null; // variable que identifica el canvas donde se pinta
 var gl =null; // variable contexto webgl2 de la aplicación
 
 var vertexShader,fragmentShader, glProgram;

 // Los datos de los vertices
  var model ={
    "vertices":[],
    "colores":[],
    "indices":[]
  };
 
    //Variables de posicion de raton
    var ratonAbajo = false;
    var posRatonX, posRatonY;
  
  

    //Matrices: ModelViewer y Proyeccion
    var mvMatrix, pMatrix;


/****************/
/** FUNCIONES **/
/****************/
/*********************** RATON: Funciones de control del Movimiento y Rotación***/

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

        var deltaX = nuevaX - posRatonX;
        var deltaY = nuevaY - posRatonY;

        var idMatrix=mat4.create();
        mat4.fromRotation(idMatrix,degToRad(deltaX/2), [0,1,0]);
        mat4.rotate(idMatrix,idMatrix,degToRad(deltaY/2), [1,0,0]);
        
        mat4.multiply(mvMatrix,idMatrix,mvMatrix);

        posRatonX = nuevaX;
        posRatonY = nuevaY;
       });
  }
/***********************************************************/
 function initMatrix(){
        mvMatrix=mat4.create();
        pMatrix=mat4.create();

        mat4.identity(mvMatrix);
        mat4.identity(pMatrix);

 }
 
 /***********************************************************/
    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
/** *************************************************
	initBuffers: iniciar los Bufferes
	En esta función crearemos el buffer de vértices y el buffer de índices
 ****************************************************/

function initBuffers(){
// Generación de vértices de la esfera y de colores
	  var latitudeBands = 75;
    var longitudeBands = 75;
    var radius = 0.8;

    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;

                model.vertices.push(radius*x);
                model.vertices.push(radius*y);
                model.vertices.push(radius*z);

                model.colores.push(radius*x);
                model.colores.push(radius*y);
                model.colores.push(radius*z);
             }
    }

 /**
 ** Buffer Vertices
 **/
  model.idBufferVertices = gl.createBuffer();
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
 
  model.itemvertices=3;
  model.numvertices= model.vertices.length/3;


// Contabilidad y generacion de indices
 for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
            for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
                var first = (latNumber * (longitudeBands + 1)) + longNumber;
                var second = first + longitudeBands + 1;
                model.indices.push(first);
                model.indices.push(second);
                model.indices.push(first + 1);

                model.indices.push(second);
                model.indices.push(second + 1);
                model.indices.push(first + 1);
            }
        } 

 /**
 ** Buffer Indices
 **/
  model.idBufferIndices = gl.createBuffer();
  gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

  model.itemindices=1;
  model.numindices= model.indices.length;

 /**
 ** Buffer Colores
 **/
  model.idBufferColores=gl.createBuffer();
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferColores);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.colores), gl.STATIC_DRAW);

	/**
	* POSICION
	*/

	 glProgram.vertexPositionAttribute= gl.getAttribLocation(glProgram, "aVertexPosition");
	 gl.enableVertexAttribArray(glProgram.vertexPositionAttribute);
	 gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
  	gl.vertexAttribPointer(glProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	 /**
	 * COLORES
	 */
	 glProgram.vertexColorAttribute= gl.getAttribLocation(glProgram, "aVertexColor");
	 gl.enableVertexAttribArray(glProgram.vertexColorAttribute);
	 gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferColores);
	 gl.vertexAttribPointer(glProgram.vertexColorAttribute,3, gl.FLOAT,false,0,0);

  	//Para Indices
  	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  	
  	// Localiza la matriz en el glProgram
    glProgram.uMvMatrix = gl.getUniformLocation(glProgram, 'uMvMatrix');

    // Localiza la matriz en el glProgram
    glProgram.uPMatrix = gl.getUniformLocation(glProgram, 'uPMatrix');
  	
 
  	}

/*********************** DIBUJAR EsCENA y ANIMAR ***************************/ 

    function drawScene(){
        //gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniformMatrix4fv(glProgram.uMvMatrix, false, mvMatrix);
        gl.uniformMatrix4fv(glProgram.uPMatrix, false, pMatrix);
        
        gl.drawElements(gl.TRIANGLES, model.numindices, gl.UNSIGNED_SHORT, 0);
    }


    function animation(){
      drawScene();
      requestAnimationFrame(animation);
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
		detectMouse()
		initBuffers();
    drawScene();
    animation();

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
	 // Buffer de profundidad
     gl.enable(gl.DEPTH_TEST);
     //Limpia los dos buffers
     gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); 	

	  //Crea un viewport del tamaño del canvas
	   gl.viewport(0, 0, canvas.width, canvas.height);

	   //Inicializar matrices modelviewer y projection
	   initMatrix();
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
			
/******
** OJO
*******/
initWebGL();