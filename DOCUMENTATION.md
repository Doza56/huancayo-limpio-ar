# 💎 Crystal Hunter: Fusion - Documentación de Diseño

Esta documentación cubre todos los puntos clave para tu presentación.

## 1. 📖 Historia del Juego
En un futuro cercano, una grieta interdimensional se ha abierto, permitiendo que **Cristales de Energía Pura** se filtren en nuestra realidad. Estos cristales son altamente inestables pero vitales para la humanidad.
Tú eres un **"Cazador de Fusión"**, un recluta de elite equipado con un visor de Realidad Aumentada capaz de ver estas anomalías. Tu misión es estabilizar (recolectar) tantos cristales como puedas antes de que la grieta colapse, evitando las **Materias Oscuras (Bombas)** que se han filtrado junto con ellos.

## 2. 🎯 Objetivo del Juego
Conseguir la **puntuación más alta posible** en una sesión de **60 segundos**.
*   **Ganar Puntos**: Dispara a los Cristales (+100).
*   **Perder Puntos**: Evita disparar a las Bombas Rojas (-500).

## 3. 👤 Personajes Principales
*   **El Cazador (Tú/Usuario)**: El juego es en **primera persona**. No hay un avatar visible; tú eres el protagonista usando tu propio cuerpo y movimiento para explorar.

## 4. 🎮 Mecánicas de Juego (Gameplay)
*   **Movimiento Físico (6DoF)**: El jugador debe caminar físicamente por su habitación para encontrar los cristales, mirar arriba, abajo y detrás de sí mismo.
*   **Shooting (Disparo)**: Al tocar la pantalla, se lanza un proyectil de energía desde la posición del móvil hacia donde apunta la cámara.
*   **Radar 3D**: Una flecha virtual flota frente al jugador indicando la dirección del cristal más cercano, ayudando a la orientación espacial.
*   **Gestión de Tiempo**: El jugador compite contra un reloj de cuenta regresiva implacable.

## 5. 🌍 Entornos / Niveles
*   **Entorno Dinámico (Realidad Aumentada)**: El "nivel" es **el mundo real** donde se encuentra el jugador (su sala, oficina, parque).
*   **Overlay Virtual**: El juego superpone elementos 3D (Cristales flotantes, iluminación, partículas) sobre la imagen de la cámara en tiempo real, fusionando lo digital con lo físico.

## 6. 🛠️ Stack Tecnológico
Herramientas de última generación para la Web moderna:
*   **Vite**: Entorno de desarrollo ultrarrápido.
*   **React 19**: Biblioteca de UI para la estructura de la aplicación.
*   **React Three Fiber (R3F)**: Renderizado 3D declarativo basado en componentes.
*   **WebXR API**: Estándar del navegador para acceder a la cámara y sensores de AR sin instalar apps.
*   **Zustand**: Gestor de estado ligero y rápido para el puntaje y la lógica del juego.
*   **Web Audio API**: Sintetizador de sonido en tiempo real (sin archivos mp3 pesados).

## 7. 🏗️ Arquitectura del Juego
El juego sigue una arquitectura **Basada en Componentes y Eventos**:
1.  **Store (Zustand)**: Mantiene la "Verdad Única" (Puntos: 500, Tiempo: 45s, Estado: 'jugando').
2.  **Scene (Motor)**:
    *   **Loop de Física (`useFrame`)**: Se ejecuta 60 veces por segundo. Calcula el movimiento de las balas y verifica colisiones.
    *   **Gestor de Entidades**: Controla la aparición y destrucción de Cristales y Bombas.
3.  **UI Layer (HUD)**: Una capa HTML/CSS transparente que muestra el marcador y menús por encima del canvas 3D.

## 8. 🔄 Flujo del Juego (Simple)
1.  **Menú Principal**: El usuario abre el link y ve la pantalla de título.
2.  **Activación AR**: Al pulsar "Jugar", se pide permiso de cámara y se entra en el modo inmersivo.
3.  **Gameplay**:
    *   Aparecen 20 objetos alrededor del usuario.
    *   El usuario busca -> Apunta -> Dispara.
    *   Si acierta: Sonido de éxito + Partículas + Puntos.
    *   Si falla o da a bomba: Sonido de error + Resta puntos.
4.  **Game Over**: Al llegar el tiempo a 0 o limpiar todos los cristales, se muestra el resumen final.
5.  **Reinicio**: Vuelta al menú para intentar superar el récord.
