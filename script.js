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
            const [palabra, imagen, descripcion] = linea.split(',');
            return { palabra: palabra.trim(), imagen: imagen.trim(), descripcion: descripcion.trim() };
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
        div.setAttribute('tabindex', '0');
        div.setAttribute('role', 'button');
        div.setAttribute('aria-label', `Select word: ${palabra}`);
        contenedorPalabras.appendChild(div);
    });

    // Generar imágenes mezcladas del grupo actual con descripciones en aria-label
    const imagenesMezcladas = [...grupos[currentGroup]]
        .sort(() => Math.random() - 0.5)
        .map(({ imagen, palabra, descripcion }) => {
            const img = document.createElement('img');
            img.className = 'imagen box';
            img.src = imagen;
            img.alt = descripcion; // Agregar descripción como texto alternativo
            img.dataset.palabra = palabra;
            img.setAttribute('tabindex', '0');
            img.setAttribute('role', 'button');
            img.setAttribute('aria-label', descripcion); // Usar descripción como aria-label
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
    cargarDatos().catch(error => console.error('Error cargando datos:', error));
});

// Funciones separadas para manejar los clicks
function manejarClickImagen(event) {
    const imagen = event.target;

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

    verificarEmparejamiento();
}

function manejarClickPalabra(event) {
    const palabra = event.target;

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

    verificarEmparejamiento();
}

function verificarEmparejamiento() {
    if (imagenSeleccionada && palabraSeleccionada) {
        if (imagenSeleccionada.dataset.palabra === palabraSeleccionada.dataset.palabra) {
            // Emparejamiento correcto
            const srMessage = document.getElementById('sr-message');
            srMessage.textContent = 'Congratulations! Correct match: ' + palabraSeleccionada.textContent;

            dibujarLinea(palabraSeleccionada, imagenSeleccionada);
            palabraSeleccionada.setAttribute('data-emparejada', 'true');
            imagenSeleccionada.setAttribute('data-emparejada', 'true');

            emparejamientosCorrectos++;
            emparejamientosGrupoActual++;
            emparejamientosCorrectosTotales++;

            actualizarBarraProgreso();

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

    const x1 = rectInicio.left + rectInicio.width / 2 - rectContenedor.left;
    const y1 = rectInicio.top + rectInicio.height / 2 - rectContenedor.top;
    const x2 = rectFin.left + rectFin.width / 2 - rectContenedor.left;
    const y2 = rectFin.top + rectFin.height / 2 - rectContenedor.top;

    const distancia = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angulo = Math.atan2(y2 - y1, x2 - x1);

    const linea = document.createElement('div');
    linea.style.position = 'absolute';
    linea.style.width = `${distancia}px`;
    linea.style.height = '3px';
    linea.style.backgroundColor = '#8EE000';
    linea.style.left = `${x1}px`;
    linea.style.top = `${y1}px`;
    linea.style.transform = `rotate(${angulo}rad)`;
    linea.style.transformOrigin = '0 0';
    linea.style.boxShadow = '0 2px 5px rgba(142, 224, 0, 0.5)';

    conexion.appendChild(linea);
}

function actualizarBarraProgreso() {
    const progreso = document.querySelector('.progreso');
    const total = 12;
    const progresoActual = (emparejamientosCorrectosTotales / total) * 100;
    progreso.style.width = `${progresoActual}%`;

    // Actualizar mensaje para screen reader
    srMessage.textContent = `Progress: ${Math.round(progresoActual)}% completed`;
}

function mostrarMensajeExito() {
    document.querySelector('.mensaje-exito').style.display = 'flex';
}

function reiniciarJuego() {
    emparejamientosCorrectos = 0;
    imagenSeleccionada = null;
    palabraSeleccionada = null;

    document.querySelectorAll('.seleccionado, [data-emparejada="true"]').forEach(elemento => {
        elemento.classList.remove('seleccionado');
        elemento.removeAttribute('data-emparejada');
    });

    document.querySelector('.conexion').innerHTML = '';
    document.querySelector('.mensaje-exito').style.display = 'none';

    actualizarBarraProgreso();
    cargarDatos().catch(error => console.error('Error cargando datos:', error));
}

// Variables globales
let currentFocusIndex = 0;
let focusableElements = [];

function obtenerElementosEnfocables() {
    return Array.from(document.querySelectorAll(
        '.palabra, .imagen, .boton-regreso, .mensaje-exito button'
    )).filter(el => {
        return el.offsetParent !== null &&
            el.getAttribute('aria-hidden') !== 'true' &&
            el.getAttribute('tabindex') !== '-1';
    });
}

function manejarFoco(event) {
    if (event.key === 'Tab') {
        event.preventDefault();
        focusableElements = obtenerElementosEnfocables();

        if (event.shiftKey) {
            currentFocusIndex = currentFocusIndex > 0 ?
                currentFocusIndex - 1 :
                focusableElements.length - 1;
        } else {
            currentFocusIndex = currentFocusIndex < focusableElements.length - 1 ?
                currentFocusIndex + 1 :
                0;
        }

        focusableElements[currentFocusIndex].focus();
    }
}

function manejarSeleccion(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.target.click();
    }
}

function inicializarNavegacion() {
    document.addEventListener('keydown', manejarFoco);

    document.querySelectorAll('.palabra, .imagen').forEach(elemento => {
        elemento.addEventListener('keydown', manejarSeleccion);
        elemento.setAttribute('tabindex', '0');
        elemento.setAttribute('role', 'button');
    });
}