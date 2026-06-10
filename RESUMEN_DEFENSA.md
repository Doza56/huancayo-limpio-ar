# 🎓 Resumen Estratégico para la Defensa del Proyecto
*(Estudiar esto para responder a los jurados)*

## 1. ¿De qué trata el proyecto? (El "Elevator Pitch")
"Es un videojuego de Realidad Aumentada Web (WebAR) llamado *Crystal Hunter: Fusion*. A diferencia de las apps tradicionales, no requiere instalar nada; funciona directamente en el navegador del móvil. El usuario debe moverse por el mundo real para encontrar y recolectar cristales virtuales en un tiempo límite."

---

## 2. Preguntas Técnicas Clave (Lo que suelen preguntar)

### ❓ "¿Qué tecnologías usaron y por qué?"
*   **Respuesta:** "Usamos un stack de JavaScript moderno:
    *   **React:** Para la interfaz del usuario.
    *   **Three.js (React Three Fiber):** Para renderizar los gráficos 3D.
    *   **WebXR API:** Es la pieza clave. Permite acceder a la cámara y detectar la posición del móvil sin instalar apps nativas.
    *   **Vite:** Para empaquetar el código y hacer que cargue super rápido."

### ❓ "¿Cómo funciona la detección de colisiones?"
*   **Respuesta:** "Usamos un sistema de *esferas delimitadoras* (Bounding Spheres). Cada bala y cada cristal tiene una burbuja invisible alrededor. El código calcula constantemente la distancia matemática entre el centro de esas burbujas. Si la distancia es menor a la suma de sus radios, contamos un impacto. Es muy eficiente para móviles."

### ❓ "¿Cómo hicieron la flecha (Radar)?"
*   **Respuesta:** "Es puro cálculo vectorial. Tomamos la posición 3D (x,y,z) del jugador y la del cristal más cercano. Calculamos el vector de diferencia y rotamos la flecha cada cuadro (60 veces por segundo) para que siempre apunte a esas coordenadas relativas."

### ❓ "¿Por qué se ve en el móvil y no en la PC?"
*   **Respuesta:** "Porque la tecnología **WebXR** requiere sensores de movimiento (acelerómetro, giroscopio) y cámara trasera, que solo tienen los teléfonos. En la PC se puede simular, pero la experiencia real es móvil."

### ❓ "¿Qué es el 'Túnel' o por qué el link es raro?"
*   **Respuesta:** "Para que la Realidad Aumentada funcione, el navegador exige una conexión segura (HTTPS). Como presentamos desde una PC local y no un servidor en la nube, usamos un 'Túnel Seguro' (`localtunnel`) para exponer nuestro servidor local a internet con HTTPS temporalmente."

---

## 3. Estructura del Código (Por si piden verlo)
Si te piden "muéstrame el código", abre `src`:

*   **`main.tsx`**: El punto de entrada.
*   **`App.tsx`**: El contenedor principal.
*   **`components/Scene.tsx`**: **¡LO MÁS IMPORTANTE!**. Aquí está la lógica del juego, las balas, los enemigos y el bucle de física.
*   **`store/gameStore.ts`**: Aquí se guardan los puntos y el tiempo (usando una librería llamada *Zustand*).
*   **`systems/SoundSystem.ts`**: El generador de sonidos.

---

## 4. Puntos Fuertes para Mencionar (Bonus)
*   **Accesibilidad:** "Cualquiera con un link puede jugar, democratizando el acceso a la AR."
*   **Rendimiento:** "Optimizamos el código para reciclar objetos (balas) y no saturar la memoria del teléfono."
*   **Innovación:** "Usamos Audio Procedural (sintetizado) en lugar de mp3, lo que hace que el juego cargue instantáneamente."
