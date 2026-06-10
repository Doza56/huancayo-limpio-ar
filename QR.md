# 📱 Guía para Crear el Código QR — Huancayo Limpio AR

Esta guía explica cómo generar un código QR profesional que apunte directamente a tu aplicación desplegada en Vercel para compartirlo fácilmente en tu presentación académica, posters y diapositivas.

---

## 🔗 URL de la Aplicación

Una vez desplegado en Vercel, tu URL de acceso será similar a:

```
https://huancayo-limpio-ar.vercel.app
```

*(El subdominio puede variar según Vercel. Copia la URL exacta desde el dashboard de Vercel.)*

---

## 🛠️ Paso 1: Generar el Código QR (Gratuito)

### Opción A — QR Code Generator (Recomendado)

1. Ve a 👉 [https://www.qr-code-generator.com](https://www.qr-code-generator.com)
2. Pega tu URL de Vercel en el campo de texto.
3. Selecciona el tipo: **URL / Enlace web**.
4. Haz clic en **"Crear código QR"**.
5. Personaliza los colores:
   - **Color principal**: `#10b981` (Verde Esmeralda)
   - **Color de fondo**: `#050d0a` (Verde oscuro profundo)
6. Descarga en formato **PNG** (mínimo 1000×1000 px) o **SVG** para impresión de alta calidad.

### Opción B — Herramienta rápida en línea

Ve a 👉 [https://qr.io](https://qr.io) o [https://www.canva.com/create/qr-codes/](https://www.canva.com/create/qr-codes/)

### Opción C — Desde la terminal (sin conexión)

Si tienes Node.js instalado puedes generar el QR directamente:

```bash
npx qrcode-terminal "https://huancayo-limpio-ar.vercel.app"
```

Para guardar como imagen PNG:

```bash
npm install -g qrcode
qrcode -o qr-huancayo-limpio-ar.png "https://huancayo-limpio-ar.vercel.app"
```

---

## 🎨 Paso 2: Diseño Recomendado para Exposición

Para un poster o diapositiva académica, incluye el QR junto a este diseño sugerido:

```
┌─────────────────────────────────────────┐
│                                         │
│   🌎  HUANCAYO LIMPIO AR                │
│                                         │
│   [████  CÓDIGO QR  ████]               │
│                                         │
│   Escanea con tu celular Android        │
│   y abre en Google Chrome               │
│                                         │
│   https://huancayo-limpio-ar.vercel.app │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ Paso 3: Validar el Código QR Antes de la Presentación

Antes de imprimir o proyectar el código QR:

1. Escanea el código QR con tu celular Android usando **Google Lens** o **Google Chrome**.
2. Verifica que:
   - [ ] La URL se abre correctamente.
   - [ ] Aparece la pantalla de carga animada con el logo 🌎.
   - [ ] El botón **"Comenzar misión 🚀"** se muestra.
   - [ ] Al presionar el botón, el navegador solicita permisos de cámara.
   - [ ] La realidad aumentada se activa correctamente.

---

## 📋 Requisitos del Escáner (Para el Jurado)

Informa al jurado antes de la demostración:

| Requisito | Detalle |
|-----------|---------|
| **Dispositivo** | Celular Android (Android 7.0+) |
| **Navegador** | Google Chrome (actualizado) |
| **Conexión** | WiFi o datos móviles activos |
| **ARCore** | Instalado automáticamente desde Play Store |
| **Permisos** | Cámara: Permitir al solicitar |
| **Posición** | Apuntar el celular hacia un espacio abierto |

---

## 💡 Consejo para la Presentación

Si el proyector o aula no tiene buena señal WiFi, puedes:

1. Activar el **Punto de Acceso (Hotspot)** de tu celular personal.
2. Conectar el celular del jurado a ese hotspot.
3. Compartir la URL de Vercel directamente por WhatsApp o QR.

La app funcionará perfectamente ya que está alojada en los servidores globales de **Vercel** (con CDN), no en tu computadora local.
