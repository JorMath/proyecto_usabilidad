let datos = [];
let imagenes = [];
let palabras = [];
let imagenSeleccionada = null;
let palabraSeleccionada = null;
let emparejamientosCorrectos = 0;

// Modifica el script.js con esto:
let currentGroup = 0;
let grupos = [];
let emparejamientosGrupoActual = 0;
const GROUP_SIZE = 3;

async function cargarDatos() {
    const respuesta = await fetch('datos.csv');
    const texto = await respuesta.text();
    const lineas = texto.split('\n').slice(1);
    
    datos = lineas
        .filter(linea => linea.trim())
        .map(linea => {
            const [palabra, imagen] = linea.split(',');
            return { palabra: palabra.trim(), imagen: imagen.trim() };
        });
    
    // Crear grupos de 3 elementos
    grupos = [];
    for (let i = 0; i < datos.length; i += GROUP_SIZE) {
        grupos.push(datos.slice(i, i + GROUP_SIZE));
    }
    
    generarElementos();
}

function generarElementos() {
    const contenedorPalabras = document.querySelector('.palabras');
    const contenedorImagenes = document.querySelector('.imagenes');
    
    // Limpiar contenedores
    contenedorPalabras.innerHTML = '';
    contenedorImagenes.innerHTML = '';
    
    // Generar palabras del grupo actual
    grupos[currentGroup].forEach(({ palabra }) => {
        const div = document.createElement('div');
        div.className = 'palabra box';
        div.textContent = palabra;
        div.dataset.palabra = palabra;
        contenedorPalabras.appendChild(div);
    });
    
    // Generar imágenes mezcladas del grupo actual
    const imagenesMezcladas = [...grupos[currentGroup]]
        .sort(() => Math.random() - 0.5)
        .map(({ imagen, palabra }) => {
            const img = document.createElement('img');
            img.className = 'imagen box';
            img.src = imagen;
            img.dataset.palabra = palabra;
            return img;
        });
    
    imagenesMezcladas.forEach(img => contenedorImagenes.appendChild(img));
    
    // Actualizar referencias y eventos
    imagenes = document.querySelectorAll('.imagen');
    palabras = document.querySelectorAll('.palabra');
    emparejamientosGrupoActual = 0;
    agregarEventos();
}

function agregarEventos() {
    // Limpiar eventos anteriores
    imagenes.forEach(img => img.replaceWith(img.cloneNode(true)));
    palabras.forEach(palabra => palabra.replaceWith(palabra.cloneNode(true)));

    // Obtener nuevas referencias
    imagenes = document.querySelectorAll('.imagen');
    palabras = document.querySelectorAll('.palabra');

    // Agregar eventos a imágenes
    imagenes.forEach(imagen => {
        imagen.addEventListener('click', manejarClickImagen);
    });

    // Agregar eventos a palabras
    palabras.forEach(palabra => {
        palabra.addEventListener('click', manejarClickPalabra);
    });
}

// Funciones separadas para manejar los clicks
function manejarClickImagen() {
    // Agregar evento click a cada imagen
imagenes.forEach(imagen => {
    imagen.addEventListener('click', () => {
        // Verificar si la imagen ya está emparejada
        if (imagen.getAttribute('data-emparejada') === 'true') {
            return;
        }

        // Verificar si ya hay una imagen seleccionada
        if (imagenSeleccionada) {
            imagenSeleccionada.classList.toggle('seleccionado');
        }

        // Seleccionar la nueva imagen
        imagen.classList.toggle('seleccionado');
        imagenSeleccionada = imagen;

        // Verificar si la palabra seleccionada coincide con la imagen
        if (palabraSeleccionada) {
            if (palabraSeleccionada.getAttribute('data-palabra') === imagen.getAttribute('data-palabra')) {
                dibujarLinea(palabraSeleccionada, imagen); // Añadir esta línea
                palabraSeleccionada.setAttribute('data-emparejada', 'true');
                imagen.setAttribute('data-emparejada', 'true');
                // Dentro de la condición de acierto en ambos listeners:
                emparejamientosCorrectos++;
                imagenSeleccionada = null;
                palabraSeleccionada = null;
                actualizarBarraProgreso(); // Añade esta línea

            } else {
                imagen.classList.toggle('seleccionado');
                palabraSeleccionada.classList.toggle('seleccionado');
                alert('ERROR!');
            }
            imagenSeleccionada = null;
            palabraSeleccionada = null;
        }

        // En ambos lugares donde estaba el alert de felicidades:
        if (emparejamientosCorrectos == imagenes.length) {
            mostrarMensajeExito();
        }

    });
});
}

function manejarClickPalabra() {
    // Agregar evento click a cada palabra
    palabras.forEach(palabra => {
        palabra.addEventListener('click', () => {
            console.log("Hola")
            // Verificar si la palabra ya está emparejada
            if (palabra.getAttribute('data-emparejada') === 'true') {
                return;
            }

            // Verificar si ya hay una palabra seleccionada
            if (palabraSeleccionada) {
                palabraSeleccionada.classList.toggle('seleccionado');
            }

            // Seleccionar la nueva palabra
            palabra.classList.toggle('seleccionado');
            palabraSeleccionada = palabra;

            // Verificar si la imagen seleccionada coincide con la palabra
            if (imagenSeleccionada) {
                if (palabra.getAttribute('data-palabra') === imagenSeleccionada.getAttribute('data-palabra')) {
                    dibujarLinea(palabra, imagenSeleccionada); // Añadir esta línea
                    palabra.setAttribute('data-emparejada', 'true');
                    imagenSeleccionada.setAttribute('data-emparejada', 'true');
                    emparejamientosCorrectos++;
                    imagenSeleccionada = null;
                    palabraSeleccionada = null;
                    actualizarBarraProgreso();


                } else {
                    imagen.classList.toggle('seleccionado');
                    palabraSeleccionada.classList.toggle('seleccionado');
                    alert('ERROR!');
                }
                imagenSeleccionada = null;
                palabraSeleccionada = null;
            }

            // En ambos lugares donde estaba el alert de felicidades:
            if (emparejamientosCorrectos == imagenes.length) {
                mostrarMensajeExito();
                console.log("Hola")
            }

        });
    });
}

function verificarEmparejamiento() {
    if (imagenSeleccionada && palabraSeleccionada) {
        if (imagenSeleccionada.dataset.palabra === palabraSeleccionada.dataset.palabra) {
            // Emparejamiento correcto
            dibujarLinea(palabraSeleccionada, imagenSeleccionada);
            palabraSeleccionada.setAttribute('data-emparejada', 'true');
            imagenSeleccionada.setAttribute('data-emparejada', 'true');
            emparejamientosCorrectos++;
            actualizarBarraProgreso();

            if (emparejamientosCorrectos === datos.length) {
                mostrarMensajeExito();
            }
        } else {
            // Emparejamiento incorrecto
            setTimeout(() => {
                imagenSeleccionada.classList.remove('seleccionado');
                palabraSeleccionada.classList.remove('seleccionado');
            }, 500);
        }

        imagenSeleccionada = null;
        palabraSeleccionada = null;
    }
}

// Función para dibujar líneas
function dibujarLinea(inicio, fin) {
    const conexion = document.querySelector('.conexion');

    // Obtener coordenadas de los elementos
    const rectInicio = inicio.getBoundingClientRect();
    const rectFin = fin.getBoundingClientRect();
    const rectContenedor = document.querySelector('.contenedor').getBoundingClientRect();

    // Calcular posiciones relativas al contenedor
    const x1 = rectInicio.left + rectInicio.width / 2 - rectContenedor.left;
    const y1 = rectInicio.top + rectInicio.height / 2 - rectContenedor.top;
    const x2 = rectFin.left + rectFin.width / 2 - rectContenedor.left;
    const y2 = rectFin.top + rectFin.height / 2 - rectContenedor.top;

    // Calcular ángulo y distancia
    const distancia = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angulo = Math.atan2(y2 - y1, x2 - x1);

    // Crear línea
    const linea = document.createElement('div');
    linea.style.position = 'absolute';
    linea.style.width = `${distancia}px`;
    linea.style.height = '2px';
    linea.style.backgroundColor = '#000';
    linea.style.left = `${x1}px`;
    linea.style.top = `${y1}px`;
    linea.style.transform = `rotate(${angulo}rad)`;
    linea.style.transformOrigin = '0 0';
    linea.style.backgroundColor = '#8EE000';
    linea.style.height = '3px';
    linea.style.boxShadow = '0 2px 5px rgba(142, 224, 0, 0.5)';

    conexion.appendChild(linea);
}



function actualizarBarraProgreso() {
    const progreso = document.querySelector('.progreso');
    const total = imagenes.length;
    const progresoActual = (emparejamientosCorrectos / total) * 100;

    progreso.style.width = `${progresoActual}%`;

    // En ambos lugares donde estaba el alert de felicidades:
    if (emparejamientosCorrectos == imagenes.length) {
        mostrarMensajeExito();
    }

}



// Elimina los alert('Felicidades!...') y reemplaza por:
function mostrarMensajeExito() {
    document.querySelector('.mensaje-exito').style.display = 'flex';
}

function reiniciarJuego() {
    // Resetear todas las variables
    emparejamientosCorrectos = 0;
    imagenSeleccionada = null;
    palabraSeleccionada = null;

    // Remover selecciones
    document.querySelectorAll('.seleccionado, [data-emparejada="true"]').forEach(elemento => {
        elemento.classList.remove('seleccionado');
        elemento.removeAttribute('data-emparejada');
    });

    // Limpiar conexiones
    document.querySelector('.conexion').innerHTML = '';

    // Ocultar mensaje
    document.querySelector('.mensaje-exito').style.display = 'none';

    // Resetear barra de progreso
    actualizarBarraProgreso();
}



// Iniciar carga de datos
cargarDatos().catch(error => console.error('Error cargando datos:', error));