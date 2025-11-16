 var canvas=null; // variable que identifica el canvas donde se pinta
 var gl =null; // variable contexto webgl2 de la aplicación
 
 var vertexShader,fragmentShader, glProgram;	

 

function initBuffers(){
  //Buffer Vertices
  idBufferVertices = gl.createBuffer();
  gl.bindBuffer (gl.ARRAY_BUFFER, idBufferVertices);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array([-1,-1,  -1,1,  1,1,  1,-1]), gl.DYNAMIC_DRAW);
}

function draw(){
    gl.useProgram(glProgram)

    const resolutionLoc = gl.getUniformLocation(glProgram, "uResolucion");
    gl.uniform2f(resolutionLoc, canvas.width, canvas.height);

    glProgram.vertexPositionAttribute= gl.getAttribLocation(glProgram, "aVertexPosition");
    gl.enableVertexAttribArray(glProgram.vertexPositionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, idBufferVertices);
	gl.vertexAttribPointer(glProgram.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}










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

function setupWebGL(){
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

function initShaders(){
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

function makeShader(src, type){
    	//COMPILAMOS EL VS
	var shader = gl.createShader(type);
	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("Error de compilación del shader: " + gl.getShaderInfoLog(shader));     
	}
	return shader;
}