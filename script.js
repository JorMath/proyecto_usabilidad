
// Obtener todas las imágenes
const imagenes = document.querySelectorAll('.imagen');
const palabras = document.querySelectorAll('.palabra');
let imagenSeleccionada = null;
let palabraSeleccionada = null;
let emparejamientosCorrectos = 0;

// Agregar evento click a cada imagen
imagenes.forEach(imagen => {
    imagen.addEventListener('click', () => {
        // Verificar si la imagen ya está emparejada
        if (imagen.getAttribute('data-emparejada') === 'true') {
            return;
        }

        // Verificar si ya hay una imagen seleccionada
        if (imagenSeleccionada) {
            imagenSeleccionada.classList.toggle('a');
        }

        // Seleccionar la nueva imagen
        imagen.classList.toggle('a');
        imagenSeleccionada = imagen;

        // Verificar si la palabra seleccionada coincide con la imagen
        if (palabraSeleccionada) {
            if (palabraSeleccionada.getAttribute('data-palabra') === imagen.getAttribute('data-palabra')) {
                palabraSeleccionada.setAttribute('data-emparejada', 'true');
                imagen.setAttribute('data-emparejada', 'true');
                emparejamientosCorrectos++;
            } else {
                imagen.classList.toggle('a');
                palabraSeleccionada.classList.toggle('a');
                alert('ERROR!');
            }
            imagenSeleccionada = null;
            palabraSeleccionada = null;
        }

        // Verificar si todos los emparejamientos están correctos
        if (emparejamientosCorrectos === imagenes.length) {
            alert('Felicidades! Has emparejado todas las imágenes correctamente.');
        }
    });
});

// Agregar evento click a cada palabra
palabras.forEach(palabra => {
    palabra.addEventListener('click', () => {
        // Verificar si la palabra ya está emparejada
        if (palabra.getAttribute('data-emparejada') === 'true') {
            return;
        }

        // Verificar si ya hay una palabra seleccionada
        if (palabraSeleccionada) {
            palabraSeleccionada.classList.toggle('a');
        }

        // Seleccionar la nueva palabra
        palabra.classList.toggle('a');
        palabraSeleccionada = palabra;

        // Verificar si la imagen seleccionada coincide con la palabra
        if (imagenSeleccionada) {
            if (palabra.getAttribute('data-palabra') === imagenSeleccionada.getAttribute('data-palabra')) {
                palabra.setAttribute('data-emparejada', 'true');
                imagenSeleccionada.setAttribute('data-emparejada', 'true');
                emparejamientosCorrectos++;

            } else {
                imagen.classList.toggle('a');
                palabraSeleccionada.classList.toggle('a');
                alert('ERROR!');
            }
            imagenSeleccionada = null;
            palabraSeleccionada = null;
        }

        // Verificar si todos los emparejamientos están correctos
        if (emparejamientosCorrectos === imagenes.length) {
            alert('Felicidades! Has emparejado todas las imágenes correctamente.');
        }
    });
});

