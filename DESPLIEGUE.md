# Guía de Publicación y Despliegue en la Nube

Esta guía te indica los pasos exactos para subir el proyecto **"Huancayo Limpio AR"** a tu cuenta de GitHub y desplegarlo en Vercel para obtener una URL pública con HTTPS.

---

## 🛠️ Paso 1: Subir el Código a GitHub

Como el proyecto ya está inicializado localmente con Git y tiene el commit inicial realizado, solo debes crear el repositorio remoto en la web de GitHub y subirlo:

1.  Abre tu navegador e ingresa a [GitHub](https://github.com).
2.  Inicia sesión y haz clic en el botón **"New"** (Nuevo Repositorio).
3.  Configura tu repositorio:
    *   **Repository name**: `huancayo-limpio-ar`
    *   **Description** *(Opcional)*: `Misión ecológica interactiva en Realidad Aumentada para concientizar sobre el reciclaje en Huancayo.`
    *   **Public / Private**: Déjalo como **Public** (Público) para que Vercel pueda leerlo en la cuenta gratuita.
    *   **Initialize repository with**: **NO marques ninguna casilla** (ni README, ni .gitignore, ni License), ya que el proyecto local ya tiene todos estos archivos creados profesionalmente.
4.  Haz clic en el botón verde **"Create repository"** (Crear repositorio).
5.  GitHub te mostrará una pantalla con comandos. Abre la terminal de tu PC (cmd o terminal de VS Code) en la carpeta del proyecto y ejecuta secuencialmente estos comandos:
    ```bash
    git remote add origin https://github.com/<TU_USUARIO_DE_GITHUB>/huancayo-limpio-ar.git
    git branch -M main
    git push -u origin main
    ```
    *(Reemplaza `<TU_USUARIO_DE_GITHUB>` por tu nombre de usuario real de GitHub).*

¡Listo! El código ya estará seguro en la nube de GitHub.

---

## 🚀 Paso 2: Desplegar en Vercel

Vercel detectará el proyecto Vite y lo compilará automáticamente en su infraestructura HTTPS segura.

1.  Ingresa a [Vercel](https://vercel.com).
2.  Regístrate o inicia sesión (se recomienda hacerlo con tu cuenta de **GitHub** para vinculación inmediata).
3.  En el dashboard principal de Vercel, haz clic en el botón azul **"Add New"** y selecciona **"Project"** (Proyecto).
4.  Verás una lista de tus repositorios de GitHub. Busca `huancayo-limpio-ar` y haz clic en el botón **"Import"** (Importar).
5.  En la pantalla de configuración del proyecto:
    *   **Framework Preset**: Selecciona **Vite** *(se detecta solo)*.
    *   **Build and Output Settings**: Déjalo por defecto (Vite compilará usando `npm run build` y el directorio de salida será `dist`).
    *   No necesitas configurar variables de entorno.
6.  Haz clic en **"Deploy"** (Desplegar).
7.  Vercel comenzará a compilar el proyecto (toma unos 30-40 segundos). Al finalizar, verás una lluvia de confeti y tu **URL de producción segura (HTTPS)** (por ejemplo: `https://huancayo-limpio-ar.vercel.app`).

---

## 📱 Paso 3: Jugar y Exponer en el Celular

Para la presentación académica, simplemente comparte la URL de Vercel (o código QR generado de la misma) con el jurado y compañeros:

1.  Abre el navegador **Chrome** (en Android) o **Safari** (en iOS) e ingresa a tu enlace de Vercel:
    `https://huancayo-limpio-ar.vercel.app`
2.  Se cargará el menú principal del juego con un diseño glassmorphism y la tipografía Outfit.
3.  Pulsa el botón **"Comenzar misión 🚀"**.
4.  El navegador te solicitará permisos para acceder a la **cámara** y los **sensores de movimiento (giroscopio)**. Haz clic en **"Permitir"**.
5.  ¡Listo! La Realidad Aumentada se activará en pantalla completa de inmediato, sin necesidad de cables, túneles o contraseñas.
