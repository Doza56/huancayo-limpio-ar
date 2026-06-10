import { Canvas } from '@react-three/fiber'
import { createXRStore, XR } from '@react-three/xr'
import './App.css'
import { Scene } from './components/Scene'
import { HUD } from './components/HUD'

const store = createXRStore()

export default function App() {
  return (
    <>
      <HUD onStartAR={() => store.enterAR()} />

      <Canvas>
        <XR store={store}>
          <Scene />
        </XR>
      </Canvas>
    </>
  )
}
