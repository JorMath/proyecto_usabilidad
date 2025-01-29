let datos = [];
let imagenes = [];
let palabras = [];
let imagenSeleccionada = null;
let palabraSeleccionada = null;
let emparejamientosCorrectos = 0;
emparejamientosCorrectosTotales = 0;
// Emparejamiento correcto
const srMessage = document.getElementById('sr-message');

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

    // Diccionario de descripciones para cada palabra
    const descriptions = {
        "Dog": "Animal that barks",
        "Cat": "Animal that meows",
        "Duck": "Water bird that quacks",
        "Cow": "Farm animal that moos",
        "Horse": "Animal used for riding",
        "Sheep": "Wool-producing farm animal",
        "Pig": "Farm animal that oinks",
        "Lion": "Big wild cat with a mane",
        "Elephant": "Large animal with a trunk",
        "Giraffe": "Tall animal with a long neck",
        "Monkey": "Tree-climbing animal",
        "Tiger": "Large striped wild cat"
    };

    // Generar palabras del grupo actual
    grupos[currentGroup].forEach(({ palabra }) => {
        const div = document.createElement('div');
        div.className = 'palabra box';
        div.textContent = palabra;
        div.dataset.palabra = palabra;
        div.setAttribute('tabindex', '0');
        div.setAttribute('role', 'button');
        div.setAttribute('aria-label', `Select word: ${palabra}`);
        contenedorPalabras.appendChild(div);
    });

    // Generar imágenes mezcladas del grupo actual con descripciones en aria-label
    const imagenesMezcladas = [...grupos[currentGroup]]
        .sort(() => Math.random() - 0.5)
        .map(({ imagen, palabra }) => {
            const img = document.createElement('img');
            img.className = 'imagen box';
            img.src = imagen;
            img.dataset.palabra = palabra;
            // Para accesibilidad, usando una descripción en inglés
            img.setAttribute('tabindex', '0');
            img.setAttribute('role', 'button');
            img.setAttribute('aria-label', descriptions[palabra] || "An image related to a word");
            return img;
        });

    imagenesMezcladas.forEach(img => contenedorImagenes.appendChild(img));

    // Actualizar referencias y eventos
    imagenes = document.querySelectorAll('.imagen');
    palabras = document.querySelectorAll('.palabra');
    emparejamientosGrupoActual = 0;
    agregarEventos();

    // Inicializar navegación para nuevos elementos
    inicializarNavegacion();

    // Establecer foco inicial
    focusableElements = obtenerElementosEnfocables();
    if (focusableElements.length > 0) {
        focusableElements[0].focus();
    }
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

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
    inicializarNavegacion();
    generarElementos();
});

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

                    

                    // Actualizar mensaje para screen readers
                    srMessage.textContent = 'Congratulations! Correct match: ' +
                        palabraSeleccionada.textContent;

                    dibujarLinea(palabraSeleccionada, imagen); // Añadir esta línea
                    palabraSeleccionada.setAttribute('data-emparejada', 'true');
                    imagen.setAttribute('data-emparejada', 'true');
                    // Dentro de la condición de acierto en ambos listeners:
                    emparejamientosCorrectos++;
                    emparejamientosGrupoActual++;
                    emparejamientosCorrectosTotales++;
                    imagenSeleccionada = null;
                    palabraSeleccionada = null;
                    actualizarBarraProgreso(); // Añade esta línea

                } else {
                    imagen.classList.toggle('seleccionado');
                    palabraSeleccionada.classList.toggle('seleccionado');
                    // Emparejamiento incorrecto
                    const srMessage = document.getElementById('sr-message');
                    srMessage.textContent = 'Incorrect match. Try again.';


                }
                imagenSeleccionada = null;
                palabraSeleccionada = null;
            }

            if (emparejamientosGrupoActual === GROUP_SIZE) {
                emparejamientosGrupoActual = 0;
                if (currentGroup < grupos.length - 1) {
                    currentGroup++;
                    setTimeout(() => {
                        generarElementos();
                    }, 1500);
                } else {
                    if (emparejamientosCorrectos === datos.length) {
                        mostrarMensajeExito();
                    }
                }
            }

        });
    });
}

// Variables globales
let currentFocusIndex = 0;
let focusableElements = [];

// Función para obtener elementos enfocables
function obtenerElementosEnfocables() {
    return Array.from(document.querySelectorAll(
        '.palabra, .imagen, .boton-regreso, .mensaje-exito button'
    )).filter(el => {
        return el.offsetParent !== null &&
            el.getAttribute('aria-hidden') !== 'true' &&
            el.getAttribute('tabindex') !== '-1';
    });
}

// Función para manejar el foco
function manejarFoco(event) {
    if (event.key === 'Tab') {
        event.preventDefault();

        focusableElements = obtenerElementosEnfocables();

        if (event.shiftKey) {
            // Shift + Tab (retroceder)
            currentFocusIndex = currentFocusIndex > 0 ?
                currentFocusIndex - 1 :
                focusableElements.length - 1;
        } else {
            // Tab (avanzar)
            currentFocusIndex = currentFocusIndex < focusableElements.length - 1 ?
                currentFocusIndex + 1 :
                0;
        }

        focusableElements[currentFocusIndex].focus();
    }
}

// Función para manejar la selección con Enter/Espacio
function manejarSeleccion(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.target.click();
    }
}

// Función para inicializar la navegación
function inicializarNavegacion() {
    document.addEventListener('keydown', manejarFoco);

    // Agregar eventos a elementos dinámicos
    document.querySelectorAll('.palabra, .imagen').forEach(elemento => {
        elemento.addEventListener('keydown', manejarSeleccion);
        elemento.setAttribute('tabindex', '0');
        elemento.setAttribute('role', 'button');
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
                    // Emparejamiento correcto
                    const srMessage = document.getElementById('sr-message');

                    // Actualizar mensaje para screen readers
                    srMessage.textContent = 'Congratulations! Correct match: ' +
                        palabraSeleccionada.textContent;

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
            const srMessage = document.getElementById('sr-message');

            // Actualizar mensaje para screen readers
            srMessage.textContent = 'Congratulations! Correct match: ' +
                palabraSeleccionada.textContent;

            // Resto de la lógica de emparejamiento
            dibujarLinea(palabraSeleccionada, imagenSeleccionada);
            palabraSeleccionada.setAttribute('data-emparejada', 'true');
            imagenSeleccionada.setAttribute('data-emparejada', 'true');
            emparejamientosCorrectos++;
            actualizarBarraProgreso();

            // Verificar si se completó el grupo
            if (emparejamientosGrupoActual === GROUP_SIZE) {
                if (currentGroup < grupos.length - 1) {
                    currentGroup++;
                    setTimeout(() => {
                        generarElementos();
                        srMessage.textContent = 'Loading next group of matches';
                    }, 1500);
                } else {
                    mostrarMensajeExito();
                    srMessage.textContent = 'Congratulations! All matches completed successfully!';
                }
            }
        } else {
            // Emparejamiento incorrecto
            const srMessage = document.getElementById('sr-message');
            srMessage.textContent = 'Incorrect match. Try again.';

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
    const total = 12;
    const progresoActual = (emparejamientosCorrectosTotales / total) * 100;

    progreso.style.width = `${progresoActual}%`;

    // En ambos lugares donde estaba el alert de felicidades:
    if (emparejamientosCorrectos == imagenes.length) {
        mostrarMensajeExito();
    }

    // Actualizar mensaje para screen reader
    srMessage.textContent = `Progress: ${Math.round(progresoActual)}% completed`;

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