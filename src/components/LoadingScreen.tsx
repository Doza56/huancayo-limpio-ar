import { useState, useEffect, useCallback } from 'react'

interface LoadingScreenProps {
    onReady: () => void
    onDemoMode: () => void
}

type ScreenState = 'loading' | 'ready' | 'error_camera' | 'error_permissions' | 'error_browser' | 'demo_prompt'

export function LoadingScreen({ onReady, onDemoMode }: LoadingScreenProps) {
    const [screen, setScreen] = useState<ScreenState>('loading')
    const [progress, setProgress] = useState(0)
    const [errorMessage, setErrorMessage] = useState('')

    const checkCompatibility = useCallback(async () => {
        // 1. Simular progreso de carga
        for (let i = 0; i <= 80; i += 10) {
            await new Promise(r => setTimeout(r, 80))
            setProgress(i)
        }

        // 2. Verificar si el navegador soporta WebXR
        const hasWebXR = 'xr' in navigator && navigator.xr !== undefined

        // 3. Verificar si es un dispositivo de escritorio (sin pantalla táctil)
        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
        const hasTouchScreen = navigator.maxTouchPoints > 0

        if (!hasWebXR) {
            setProgress(100)
            if (!isMobile && !hasTouchScreen) {
                // Escritorio sin WebXR → ofrecer modo demo
                setScreen('demo_prompt')
            } else {
                // Móvil sin WebXR → navegador incompatible
                setScreen('error_browser')
            }
            return
        }

        // 4. Verificar soporte de 'immersive-ar'
        try {
            const supported = await navigator.xr!.isSessionSupported('immersive-ar')
            setProgress(100)

            if (!supported) {
                if (!isMobile && !hasTouchScreen) {
                    setScreen('demo_prompt')
                } else {
                    setScreen('error_browser')
                }
                return
            }
        } catch {
            setProgress(100)
            setScreen('error_browser')
            return
        }

        // 5. Verificar permiso de cámara
        try {
            const perm = await navigator.permissions.query({ name: 'camera' as PermissionName })
            if (perm.state === 'denied') {
                setProgress(100)
                setErrorMessage('El permiso de cámara fue denegado. Para continuar, ve a la configuración de tu navegador y activa el permiso de cámara para este sitio.')
                setScreen('error_permissions')
                return
            }
        } catch {
            // Navigator.permissions puede no estar disponible en todos los navegadores; continuamos
        }

        setProgress(100)
        await new Promise(r => setTimeout(r, 400))
        setScreen('ready')
        onReady()
    }, [onReady])

    useEffect(() => {
        checkCompatibility()
    }, [checkCompatibility])

    // — PANTALLA DE CARGA —
    if (screen === 'loading') {
        return (
            <div className="loading-screen">
                <div className="ls-content">
                    <div className="ls-logo-wrap">
                        <div className="ls-globe-ring">
                            <span className="ls-globe">🌎</span>
                        </div>
                    </div>
                    <h1 className="ls-title">HUANCAYO LIMPIO AR</h1>
                    <p className="ls-subtitle">Preparando experiencia de realidad aumentada...</p>
                    <div className="ls-progress-bar-wrap">
                        <div className="ls-progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="ls-percent">{progress}%</span>
                    <div className="ls-dots">
                        <span /><span /><span />
                    </div>
                </div>
            </div>
        )
    }

    // — PANTALLA MODO DEMO —
    if (screen === 'demo_prompt') {
        return (
            <div className="loading-screen">
                <div className="ls-content ls-error-card glass">
                    <span className="ls-error-icon">🖥️</span>
                    <h2 className="ls-error-title">Modo Demostración</h2>
                    <p className="ls-error-msg">
                        Tu navegador de escritorio no soporta Realidad Aumentada nativa.<br />
                        Puedes explorar el juego en <strong>Modo Demo</strong> usando el <strong>mouse y teclado</strong>, o abrirlo desde tu <strong>celular Android con Google Chrome</strong> para la experiencia AR completa.
                    </p>
                    <div className="ls-btn-group">
                        <button className="btn-primary" onClick={onDemoMode}>
                            🖱️ Continuar en Modo Demo
                        </button>
                        <div className="ls-tip glass">
                            <strong>💡 Consejo:</strong> Para AR completo, escanea el código QR con tu celular Android y abre el enlace en Chrome.
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // — PANTALLA ERROR: CÁMARA NO DISPONIBLE —
    if (screen === 'error_camera') {
        return (
            <div className="loading-screen">
                <div className="ls-content ls-error-card glass">
                    <span className="ls-error-icon">📷</span>
                    <h2 className="ls-error-title">Cámara No Disponible</h2>
                    <p className="ls-error-msg">
                        No fue posible acceder a la cámara de tu dispositivo. Es posible que otro programa la esté usando.
                    </p>
                    <ul className="ls-help-list">
                        <li>Cierra otras aplicaciones de cámara o videoconferencias abiertas.</li>
                        <li>Recarga esta página e intenta nuevamente.</li>
                        <li>Verifica que tu dispositivo tenga cámara trasera disponible.</li>
                    </ul>
                    <button className="btn-primary" onClick={() => window.location.reload()}>
                        🔄 Reintentar
                    </button>
                </div>
            </div>
        )
    }

    // — PANTALLA ERROR: PERMISOS DENEGADOS —
    if (screen === 'error_permissions') {
        return (
            <div className="loading-screen">
                <div className="ls-content ls-error-card glass">
                    <span className="ls-error-icon">🚫</span>
                    <h2 className="ls-error-title">Permisos de Cámara Denegados</h2>
                    <p className="ls-error-msg">{errorMessage}</p>
                    <ul className="ls-help-list">
                        <li><strong>Chrome Android:</strong> Toca el ícono 🔒 en la barra de dirección → Permisos → Cámara → Permitir.</li>
                        <li><strong>Safari iOS:</strong> Ajustes → Safari → Cámara → Permitir.</li>
                    </ul>
                    <button className="btn-primary" onClick={() => window.location.reload()}>
                        🔄 Reintentar
                    </button>
                </div>
            </div>
        )
    }

    // — PANTALLA ERROR: NAVEGADOR INCOMPATIBLE —
    if (screen === 'error_browser') {
        return (
            <div className="loading-screen">
                <div className="ls-content ls-error-card glass">
                    <span className="ls-error-icon">⚠️</span>
                    <h2 className="ls-error-title">Navegador No Compatible</h2>
                    <p className="ls-error-msg">
                        Tu navegador o dispositivo no soporta <strong>WebXR</strong>, la tecnología requerida para la realidad aumentada.
                    </p>
                    <ul className="ls-help-list">
                        <li>Usa <strong>Google Chrome</strong> actualizado en un celular <strong>Android</strong>.</li>
                        <li>Asegúrate de que tu dispositivo tenga <strong>ARCore</strong> instalado (Android 7+).</li>
                        <li>En iOS, WebXR tiene soporte limitado. Se recomienda Android para esta experiencia.</li>
                    </ul>
                    <a
                        className="btn-primary"
                        href="https://play.google.com/store/apps/details?id=com.android.chrome"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        📲 Descargar Google Chrome
                    </a>
                </div>
            </div>
        )
    }

    // Estado 'ready' — no renderizar nada; el juego tomará el control
    return null
}
