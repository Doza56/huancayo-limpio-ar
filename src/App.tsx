import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Canvas } from '@react-three/fiber'
import { createXRStore, XR } from '@react-three/xr'
import './App.css'
import { Scene } from './components/Scene'
import { HUD } from './components/HUD'
import { LoadingScreen } from './components/LoadingScreen'
import { DemoScene } from './components/DemoScene'

// El div overlay se crea una sola vez fuera del ciclo de React para que el ref esté disponible
// antes de que el XRStore lo necesite como domOverlay.
const xrOverlayEl = document.createElement('div')
xrOverlayEl.id = 'xr-overlay'
Object.assign(xrOverlayEl.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    zIndex: '9999',
    pointerEvents: 'none',
    overflow: 'hidden'
})
document.body.appendChild(xrOverlayEl)

// XRStore creado con el overlay registrado desde el principio
const xrStore = createXRStore({
    domOverlay: xrOverlayEl
})

export default function App() {
    const [appReady, setAppReady] = useState(false)
    const [isDemoMode, setIsDemoMode] = useState(false)
    const [, forceUpdate] = useState(0)

    // Forzar re-render después de montar para que el portal al xrOverlayEl funcione
    useEffect(() => {
        forceUpdate(n => n + 1)
    }, [])

    const handleReady = () => setAppReady(true)
    const handleDemoMode = () => {
        setIsDemoMode(true)
        setAppReady(true)
    }

    // Mostrar pantalla de carga hasta que la app esté lista
    if (!appReady) {
        return <LoadingScreen onReady={handleReady} onDemoMode={handleDemoMode} />
    }

    // Modo Demo para escritorio (sin WebXR)
    if (isDemoMode) {
        return (
            <>
                <HUD onStartAR={() => {}} isDemoMode />
                <DemoScene />
            </>
        )
    }

    // Modo AR normal (móvil con WebXR)
    // El HUD se inyecta dentro del div#xr-overlay mediante createPortal.
    // WebXR mantiene visible ese div durante la sesión AR (domOverlay API),
    // lo que permite que el contador, el temporizador y las pantallas de resultado
    // se muestren correctamente sobre la cámara en tiempo real.
    return (
        <>
            {/* Canvas 3D con la escena AR de Three.js */}
            <Canvas>
                <XR store={xrStore}>
                    <Scene />
                </XR>
            </Canvas>

            {/* Portal del HUD hacia el div#xr-overlay registrado como WebXR DOM Overlay.
                Esto garantiza que el HUD sea visible durante la sesión AR en el móvil. */}
            {createPortal(
                <HUD
                    onStartAR={() => xrStore.enterAR()}
                    isDemoMode={false}
                />,
                xrOverlayEl
            )}
        </>
    )
}
