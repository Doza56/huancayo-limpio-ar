import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { createXRStore, XR } from '@react-three/xr'
import './App.css'
import { Scene } from './components/Scene'
import { HUD } from './components/HUD'
import { LoadingScreen } from './components/LoadingScreen'
import { DemoScene } from './components/DemoScene'

const store = createXRStore()

export default function App() {
    const [appReady, setAppReady] = useState(false)
    const [isDemoMode, setIsDemoMode] = useState(false)

    const handleReady = () => {
        setAppReady(true)
    }

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
    return (
        <>
            <HUD onStartAR={() => store.enterAR()} isDemoMode={false} />
            <Canvas>
                <XR store={store}>
                    <Scene />
                </XR>
            </Canvas>
        </>
    )
}
