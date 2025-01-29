let frases = [];
        let currentPhraseIndex = 0;
        let progresoTotal = 0;

        async function cargarDatos() {
            const respuesta = await fetch('frases.csv');
            const texto = await respuesta.text();
            const lineas = texto.split('\n').slice(1);
            
            frases = lineas
                .filter(linea => linea.trim())
                .map(linea => {
                    const [frase, respuesta, ...distractores] = linea.split(',');
                    return {
                        frase: frase.trim(),
                        respuesta: respuesta.trim(),
                        opciones: [respuesta.trim(), ...distractores.map(d => d.trim())].sort(() => Math.random() - 0.5)
                    };
                });
            
            iniciarJuego();
        }

        function iniciarJuego() {
            const fraseActual = frases[currentPhraseIndex];
            const contenedorFrases = document.getElementById('frase-container');
            const opcionesContainer = document.getElementById('opciones-container');
            
            contenedorFrases.innerHTML = `<p tabindex="0">${fraseActual.frase.replace('___', 
                `<span class="palabra-faltante" data-respuesta="${fraseActual.respuesta}" aria-live="polite"></span>`)}</p>`;            
            
            opcionesContainer.innerHTML = '';
            fraseActual.opciones.forEach((opcion, index) => {
                const div = document.createElement('div');
                div.className = 'opcion';
                div.textContent = opcion;
                div.draggable = true;
                div.dataset.respuesta = opcion;
                div.dataset.tecla = index + 1;
                div.tabIndex=0;
                div.ariaLive="polite";
                opcionesContainer.appendChild(div);
            });
            
            agregarEventos();
            actualizarProgreso();
        }

        function agregarEventos() {
            document.querySelectorAll('.opcion').forEach(opcion => {
                opcion.addEventListener('dragstart', e => {
                    e.dataTransfer.setData('text/plain', opcion.dataset.respuesta);
                    opcion.classList.add('arrastrando');
                });
                
                opcion.addEventListener('dragend', () => {
                    opcion.classList.remove('arrastrando');
                });
            });

            document.querySelector('.palabra-faltante').addEventListener('dragover', e => {
                e.preventDefault();
            });

            document.querySelector('.palabra-faltante').addEventListener('drop', e => {
                e.preventDefault();
                const respuesta = e.dataTransfer.getData('text/plain');
                verificarRespuesta(document.querySelector('.palabra-faltante'), respuesta);
            });

            document.addEventListener('keydown', e => {
                if (e.key >= 1 && e.key <= 4) {
                    const opcionIndex = parseInt(e.key) - 1;
                    const opcion = document.querySelectorAll('.opcion')[opcionIndex];
                    if (opcion) {
                        verificarRespuesta(document.querySelector('.palabra-faltante'), opcion.dataset.respuesta);
                    }
                }
            });
        }

        function verificarRespuesta(zona, respuesta) {
            document.querySelectorAll('.opcion').forEach(opcion => opcion.classList.remove('arrastrando'));
            
            if (zona.dataset.respuesta === respuesta) {
                zona.textContent = respuesta;
                zona.style.borderBottom = 'none';
                zona.style.color = '#2ecc71';
                zona.style.fontWeight = 'bold';
                zona.style.animation = 'pop 0.3s ease';
                
                progresoTotal++;
                actualizarProgreso();
                
                if (currentPhraseIndex < frases.length - 1) {
                    currentPhraseIndex++;
                    setTimeout(iniciarJuego, 1000);
                } else {
                    mostrarMensajeExito();
                }
            } else {
                zona.style.animation = 'shake 0.5s';
                zona.style.color = '#e74c3c';
                setTimeout(() => {
                    zona.style.animation = '';
                    zona.style.color = 'inherit';
                }, 500);
            }
        }

        function actualizarProgreso() {
            const porcentaje = (progresoTotal / frases.length) * 100;
            document.querySelector('.progreso').style.width = `${porcentaje}%`;
            document.querySelector('.progreso').setAttribute('aria-valuenow', porcentaje);
        }

        function mostrarMensajeExito() {
            document.querySelector('.mensaje-exito').style.display = 'flex';
        }

        function reiniciarJuego() {
            currentPhraseIndex = 0;
            progresoTotal = 0;
            document.querySelector('.mensaje-exito').style.display = 'none';
            cargarDatos().catch(error => console.error('Error:', error));
        }

        // Iniciar el juego
        cargarDatos().catch(error => console.error('Error:', error));