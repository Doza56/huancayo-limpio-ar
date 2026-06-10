# 🎓 Presentación Académica — Huancayo Limpio AR

## 📝 Resumen del Proyecto

**Huancayo Limpio AR** es una aplicación interactiva de Realidad Aumentada (AR) basada en la web (WebXR) y diseñada con un enfoque educativo. Transforma un entorno lúdico tridimensional en una herramienta pedagógica orientada a la concienciación sobre la contaminación urbana y la cultura del reciclaje. Los usuarios actúan como agentes ambientales encargados de capturar y clasificar residuos mediante mecánicas de gamificación.

---

## 🛑 1. Problema Identificado

La ciudad de Huancayo, ubicada en la región Junín, Perú, enfrenta una crisis socioambiental crítica relacionada con la gestión de residuos sólidos urbanos y la degradación ecológica.

### Aspectos Críticos del Problema:
*   **Contaminación del Río Mantaro:** Uno de los afluentes más importantes de los Andes peruanos recibe diariamente toneladas de basura doméstica, plásticos e insumos químicos de la agricultura local, destruyendo su biodiversidad.
*   **Falta de Cultura de Segregación:** La población local presenta bajos índices de separación en origen de residuos aprovechables (plásticos, latas, papel) y residuos peligrosos (pilas, baterías, envases de pesticidas).
*   **Ineficiencia en la Educación Ambiental Tradicional:** Los folletos impresos y las charlas pasivas han demostrado tener un impacto limitado en los hábitos cotidianos de los ciudadanos más jóvenes (escolares y universitarios).
*   **Brecha Tecnológica en Aplicaciones Locales:** Falta de herramientas tecnológicas interactivas y accesibles diseñadas específicamente bajo el contexto de Huancayo para promover el aprendizaje práctico y dinámico.

---

## 🎯 2. Objetivos del Proyecto

### Objetivo General:
Desarrollar e implementar una plataforma interactiva en Realidad Aumentada (WebXR) que actúe como un simulador educativo para sensibilizar a los ciudadanos de Huancayo sobre la segregación de residuos sólidos y promover la preservación del ecosistema local.

### Objetivos Específicos:
1.  **Diseñar un sistema interactivo lúdico (Gamification):** Crear una mecánica de "escanear y recolectar" residuos usando la cámara del dispositivo móvil, asignando puntajes positivos a reciclables y penalizaciones a residuos peligrosos.
2.  **Educar en tiempo real:** Desplegar tarjetas informativas (factoids) y reportes de fin de partida que presenten datos reales sobre el tiempo de degradación de materiales y estadísticas ambientales de Huancayo.
3.  **Garantizar accesibilidad universal:** Utilizar estándares de Realidad Aumentada Web (WebXR) para que la experiencia se ejecute directamente desde navegadores móviles populares (Google Chrome, Samsung Internet) sin necesidad de descargar aplicaciones nativas en tiendas (Google Play, App Store).
4.  **Implementar adaptabilidad multiplataforma:** Ofrecer un "Modo Demostración" para escritorio controlado por ratón y teclado, facilitando su exposición ante proyectores en salones de clase.
5.  **Desplegar con HTTPS en la nube:** Alojar el código en un entorno de producción estable (Vercel) con certificados de seguridad para habilitar los permisos nativos de cámara requeridos por las APIs móviles.

---

## 🛠️ 3. Tecnologías Utilizadas

La arquitectura de **Huancayo Limpio AR** se estructuró sobre tecnologías modernas de desarrollo web y gráficos 3D:

*   **Vite + React 19:** Entorno de compilación ultra rápido y biblioteca frontend basada en componentes reactivos y eficientes.
*   **Three.js & React Three Fiber (R3F):** Motor de renderizado 3D de alto rendimiento adaptado al paradigma declarativo de React para manipular luces, mallas y físicas.
*   **@react-three/xr:** Biblioteca de soporte para WebXR que facilita la integración con dispositivos compatibles con ARCore y la captura de poses de la cámara en AR.
*   **Zustand:** Gestor de estado global ligero y rápido que almacena la puntuación, estadísticas de recolección, logros desbloqueados y flujos de juego.
*   **Web Audio API (SoundSystem):** Generador de efectos de sonido sintetizados dinámicamente mediante osciladores, eliminando el peso de archivos de audio tradicionales (`.mp3` o `.wav`) y reduciendo el tamaño del bundle.
*   **Tailwind CSS & Vanilla CSS:** Diseño de interfaz basado en Glassmorphism (paneles translúcidos con desenfoque de fondo) para una estética de visor de ciencia ficción futurista.
*   **Vercel:** Plataforma de hosting y distribución en el borde (Edge Hosting) con SSL/HTTPS automático y entrega mediante CDN global.

---

## 🌍 4. Impacto Social y Educativo

*   **Reducción de Barreras de Entrada:** Al ser una aplicación WebXR, no consume espacio de almacenamiento en el celular del usuario ni requiere actualizaciones manuales. El aprendizaje comienza inmediatamente con un escaneo de código QR.
*   **Fomento de la Conciencia Local:** Los datos pedagógicos contextualizados en la provincia de Huancayo (como la situación del Río Mantaro o botaderos locales) generan una mayor identificación y empatía con el entorno inmediato.
*   **Gamificación del Aprendizaje:** La recompensa de logros (`Primer Reciclaje`, `Héroe del Mantaro`) incentiva la repetición del juego, reforzando cognitivamente la diferencia entre botellas de plástico, latas y agentes contaminantes como pilas o reactivos químicos.
*   **Eco-Responsabilidad Digital:** Al reemplazar folletos en papel por una experiencia virtual interactiva, el proyecto se alinea con prácticas de cero desperdicio en la educación ambiental.

---

## 📌 5. Conclusiones

1.  **Viabilidad de WebXR:** Se demostró que es posible construir experiencias inmersivas 3D estables y fluidas para navegadores móviles sin depender de entornos complejos como Unity o aplicaciones nativas compiladas.
2.  **Gamificación como Canal Didáctico:** La inclusión de una puntuación de "Impacto Ambiental" y logros tangibles motiva significativamente al usuario a evitar residuos tóxicos, asimilando la clasificación de residuos de forma intuitiva.
3.  **Seguridad Obligatoria:** El despliegue a través de HTTPS resultó indispensable, ya que los navegadores modernos restringen el acceso a sensores y cámaras bajo protocolos HTTP inseguros.
4.  **Inclusión Multiplataforma:** El modo de simulación de escritorio asegura que ningún alumno sea excluido de la sesión de aprendizaje si su dispositivo móvil personal no posee hardware de realidad aumentada (ARCore).

---

## 🔮 6. Futuras Mejoras y Escabilidad

*   **Geolocalización (GPS Integration):** Integrar geolocalización para crear "Limpiezas Virtuales Georreferenciadas", obligando al estudiante a desplazarse a puntos históricos o parques específicos de Huancayo (ej. Plaza Constitución o Parque de la Identidad Huanca) para capturar residuos virtuales.
*   **Reconocimiento de Residuos Reales (IA & Computer Vision):** Implementar modelos de inteligencia artificial ligeros (como TensorFlow.js) a través de la cámara para reconocer botellas y residuos plásticos reales en el entorno del usuario, otorgando bonificaciones en el juego al desecharlos físicamente.
*   **Conexión con Contenedores Inteligentes (IoT):** Vincular la aplicación web con tachos de reciclaje inteligentes en la universidad o colegios mediante códigos QR dinámicos, validando que el usuario realmente depositó sus botellas físicas para desbloquear trajes o medallas digitales.
*   **Modo Multijugador Cooperativo:** Permitir que múltiples estudiantes limpien un mismo patio de la escuela o universidad en tiempo real compartiendo el mismo mapa espacial en AR.
