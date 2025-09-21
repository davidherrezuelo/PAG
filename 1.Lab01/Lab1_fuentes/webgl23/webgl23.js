// Ejemplo que a partir de un contexto 2d
// Dibuja un rectangulo relleno 
function dibujaRectangulo() {  
  // Conseguir el canvas
  var canvas = document.getElementById("ejemplo");  
  if (!canvas) { 
    alert("---> No se soporta la funcionalidad de canvas");
    return; 
  } 

  // Contexto webgl seleccionado a  2d
  var gl = canvas.getContext("2d");

  // Dibuja un rectangulo azul
  gl.fillStyle = "rgba(0, 0, 255, 1.0)"; // Se pone el color a azul con el alfa(transparencia) a 0(0-255)
  gl.fillRect(120, 10, 150, 200);        // Se dibuja un rectángulo 
				          // 120 10 -- coordX, coordY: esquina sup izquierda del canvas
					  // 150 anchura 200 altura 
}
