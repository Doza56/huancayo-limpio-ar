# Huancayo Limpio AR: Educación Ambiental en Realidad Aumentada

**Huancayo Limpio AR** es una aplicación educativa interactiva e inmersiva desarrollada en **Realidad Aumentada (WebAR)** para dispositivos móviles. Su objetivo principal es concientizar a la población urbana sobre la segregación de residuos sólidos y promover la cultura del reciclaje en la ciudad de Huancayo, Junín, Perú.

Esta herramienta ha sido diseñada bajo un enfoque académico y de gamificación, transformando el aprendizaje ecológico en una experiencia interactiva donde el usuario explora físicamente su entorno real para localizar, identificar y clasificar diversos tipos de residuos.

---

## 🏛️ Contexto y Problemática Abordada

La ciudad de Huancayo enfrenta serios desafíos respecto a la gestión de residuos sólidos y la contaminación ambiental urbana. Entre los problemas más críticos destacan:

1.  **Acumulación de Residuos Urbanos**: El crecimiento demográfico acelerado y la falta de segregación en origen han provocado que plazas, calles y áreas públicas acumulen basura no clasificada de forma habitual.
2.  **Contaminación del Río Mantaro**: Uno de los ecosistemas fluviales más importantes de la sierra central de Perú sufre el vertido constante de botellas de plástico, latas, empaques y sustancias químicas nocivas, destruyendo la biodiversidad local y afectando la salud pública agrícola.
3.  **Falta de Conciencia sobre Residuos Peligrosos**: Las pilas usadas, baterías y productos químicos de uso doméstico frecuentemente se desechan junto con la basura común. Estos liberan metales pesados (mercurio, plomo, cadmio) que contaminan el suelo y las napas freáticas de la cuenca del Mantaro.

**Huancayo Limpio AR** aborda esta problemática aplicando la **gamificación inmersiva** para adiestrar a los ciudadanos en la diferenciación práctica de los residuos reciclables frente a los contaminantes críticos.

---

## 🎯 Objetivos Académicos

*   **Educación Activa**: Desarrollar la memoria procedimental del usuario mediante la clasificación espacial de materiales en un entorno de realidad aumentada en primera persona.
*   **Fomento de la Cultura del Reciclaje**: Mostrar al usuario estadísticas e información sobre el tiempo de degradación de los materiales y los beneficios ecológicos del reciclaje correcto.
*   **Concientización Inmediata**: Penalizar el contacto imprudente con residuos peligrosos (pilas, químicos) mediante mecánicas lúdicas de impacto ambiental negativo, reforzando el concepto de manejo especial.

---

## 🎮 Mecánicas de la Misión Ecológica

*   **Exploración Física (3DoF/6DoF)**: El usuario utiliza la cámara del celular para rastrear residuos virtuales flotando en su entorno real.
*   **Burbuja de Captura**: Al tocar la pantalla, se emite una burbuja de energía purificadora para recolectar el objeto apuntado.
*   **Detección y Clasificación**:
    *   **Residuos Reciclables (+100 de Impacto)**: Botellas de plástico, latas de aluminio, papel, cajas de cartón y envases.
    *   **Residuos Peligrosos (-500 de Impacto)**: Pilas AA, baterías de plomo, tambores de residuos tóxicos y matraces químicos.
*   **Detector Ambiental (Radar)**: Una aguja magnética 3D flotante señala constantemente la ubicación del residuo reciclable más cercano, incentivando la orientación espacial.
*   **Modo Huancayo**: Durante la partida, se despliegan tarjetas informativas breves sobre el cuidado ecológico de lugares emblemáticos como el Río Mantaro.
*   **Insignias de Logros**: Reconocimiento en tiempo real por volumen reciclado (desde el "Primer Reciclaje" hasta convertirse en "Héroe del Mantaro").

---

## 🛠️ Stack Tecnológico

La arquitectura de la aplicación es moderna y ligera para asegurar fluidez en navegadores móviles sin requerir instalación previa:

*   **React 19** & **Vite**: Entorno ágil de renderizado de componentes y empaquetado ultraveloz.
*   **Three.js** & **React Three Fiber (R3F)**: Renderizado declarativo 3D de alta eficiencia con soporte para iluminación, sombras y animaciones físicas.
*   **@react-three/drei**: Integración de overlays HTML (`<Html>`) en coordenadas 3D para textos flotantes.
*   **WebXR Device API** (`@react-three/xr` v6): Acceso nativo y seguro a los sensores de posicionamiento y cámara del dispositivo móvil para proyectar los objetos en realidad aumentada.
*   **Zustand**: Gestión global de estado rápida para evitar renders innecesarios en el bucle principal de físicas (60 FPS).
*   **Web Audio API**: Generación procedural de efectos sonoros interactivos sin carga de archivos de audio pesados.

---

## 💻 Instalación y Desarrollo Local

### Requisitos Previos
*   **Node.js** (Versión 20+ recomendada).
*   **Git** instalado.

### Pasos
1.  Clonar el repositorio:
    ```bash
    git clone https://github.com/<tu-usuario>/huancayo-limpio-ar.git
    cd huancayo-limpio-ar
    ```
2.  Instalar las dependencias del proyecto:
    ```bash
    npm install
    ```
3.  Iniciar el servidor de desarrollo local:
    ```bash
    npm run dev
    ```
4.  Para acceder con realidad aumentada desde un celular en desarrollo local, se debe hacer mediante **HTTPS** o utilizando **Depuración USB por cable** apuntando a `localhost:5173` (mediante `chrome://inspect` en Chrome).

---

## 🚀 Despliegue en la Nube (Vercel)

El proyecto está optimizado para funcionar directamente en la plataforma **Vercel**, eliminando la necesidad de túneles locales inestables. Vercel proporciona certificados **HTTPS** automáticos, un requisito obligatorio de los navegadores móviles (Chrome y Safari) para permitir el uso de la cámara y sensores de giroscopio en realidad aumentada.

### Instrucciones para Desplegar:
1.  Sube tu código local a un repositorio en **GitHub**.
2.  Inicia sesión en [Vercel](https://vercel.com).
3.  Haz clic en **"Add New"** -> **"Project"** y selecciona tu repositorio `huancayo-limpio-ar`.
4.  Configura las opciones por defecto (Vercel detectará automáticamente **Vite**):
    *   **Framework Preset**: `Vite`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
5.  Haz clic en **"Deploy"**. En menos de un minuto tendrás una URL pública y segura (ejemplo: `https://huancayo-limpio-ar.vercel.app`) para probar y exponer tu proyecto universitario.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - consulte el archivo [LICENSE](file:///e:/XAMPP/HTDOCS/APP%20AR%20-2.2/LICENSE) para más detalles.
