import { useEffect, useState, useRef } from 'react'
import { useGameStore, ACHIEVEMENTS } from '../store/gameStore'

interface HUDProps {
    onStartAR?: () => void
    isDemoMode?: boolean
}

const EDUCATIONAL_CARDS = [
    "Protejamos el Río Mantaro evitando arrojar residuos.",
    "La contaminación afecta la calidad de vida en Huancayo.",
    "Mantener limpias las áreas públicas mejora la salud de todos.",
    "El reciclaje ayuda a reducir la acumulación de basura en la ciudad.",
    "Cuidar el medio ambiente es responsabilidad de todos."
]

export function HUD({ onStartAR, isDemoMode = false }: HUDProps) {
    const {
        score,
        timeLeft,
        gameState,
        stats,
        unlockedAchievements,
        lastFact,
        flashColor,
        tickTimer,
        reset,
        startGame
    } = useGameStore()

    // Estado para tarjetas informativas (Modo Huancayo)
    const [currentCard, setCurrentCard] = useState<string | null>(null)
    const [showCard, setShowCard] = useState(false)

    // Estado para notificaciones de logros
    const [latestAchievement, setLatestAchievement] = useState<{ name: string; description: string; icon: string } | null>(null)
    const [showAchievementNotify, setShowAchievementNotify] = useState(false)
    const prevAchievementsCount = useRef(0)

    // Temporizador del juego
    useEffect(() => {
        if (gameState === 'playing') {
            const interval = setInterval(() => {
                tickTimer(1)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [gameState, tickTimer])

    // Manejar el bucle de tarjetas educativas cada 15 segundos
    useEffect(() => {
        if (gameState !== 'playing') {
            setShowCard(false)
            setCurrentCard(null)
            return
        }

        // Mostrar primera tarjeta a los 5 segundos de empezar
        const initialTimeout = setTimeout(() => {
            const index = Math.floor(Math.random() * EDUCATIONAL_CARDS.length)
            setCurrentCard(EDUCATIONAL_CARDS[index])
            setShowCard(true)

            // Ocultarla después de 5 segundos
            setTimeout(() => {
                setShowCard(false)
            }, 5000)
        }, 5000)

        // Luego mostrar una cada 18 segundos
        const interval = setInterval(() => {
            const index = Math.floor(Math.random() * EDUCATIONAL_CARDS.length)
            setCurrentCard(EDUCATIONAL_CARDS[index])
            setShowCard(true)

            const hideTimer = setTimeout(() => {
                setShowCard(false)
            }, 5000)

            return () => clearTimeout(hideTimer)
        }, 18000)

        return () => {
            clearTimeout(initialTimeout)
            clearInterval(interval)
        }
    }, [gameState])

    // Monitorear logros desbloqueados para notificaciones
    useEffect(() => {
        if (gameState === 'playing' && unlockedAchievements.length > prevAchievementsCount.current) {
            const latestId = unlockedAchievements[unlockedAchievements.length - 1]
            const ach = ACHIEVEMENTS.find(a => a.id === latestId)
            if (ach) {
                setLatestAchievement(ach)
                setShowAchievementNotify(true)
                
                const timer = setTimeout(() => {
                    setShowAchievementNotify(false)
                }, 3500)
                
                prevAchievementsCount.current = unlockedAchievements.length
                return () => clearTimeout(timer)
            }
        }
        if (gameState === 'menu') {
            prevAchievementsCount.current = 0
        }
    }, [unlockedAchievements, gameState])

    const handlePlayClick = () => {
        startGame()
        if (onStartAR) {
            onStartAR()
        }
    }

    // --- PANTALLA DE INICIO ---
    if (gameState === 'menu') {
        return (
            <div className="ui-overlay menu-overlay">
                <div className="menu-card glass">
                    <div className="logo-container">
                        <span className="logo-icon">🌎</span>
                        <h1>HUANCAYO LIMPIO AR</h1>
                    </div>
                    <p className="subtitle">
                        {isDemoMode
                            ? 'Modo demostración en escritorio. Usa el mouse para rotar y haz clic para capturar residuos.'
                            : 'Utiliza realidad aumentada para limpiar virtualmente la ciudad y aprender sobre el reciclaje.'}
                    </p>
                    {isDemoMode && (
                        <div className="demo-mode-notice">
                            🖥️ <strong>Modo Demo activo</strong> — Sin cámara AR. Arrastra para rotar, clic para capturar.
                        </div>
                    )}
                    <div className="instructions">
                        <h3>Misión del Agente Ambiental:</h3>
                        <ul>
                            <li>🟢 Recolecta botellas, latas, papeles y cartones (+100 Impacto).</li>
                            <li>🔴 Evita tocar pilas, baterías y químicos tóxicos (-500 Impacto).</li>
                            {isDemoMode
                                ? <li>🖱️ Arrastra para rotar la vista · Clic para capturar.</li>
                                : <li>🧭 Sigue el Detector Ambiental verde para encontrar los residuos.</li>}
                        </ul>
                    </div>
                    <button className="btn-primary" onClick={handlePlayClick}>
                        {isDemoMode ? '▶️ Iniciar Demostración' : 'Comenzar misión 🚀'}
                    </button>
                </div>
            </div>
        )
    }

    // --- PANTALLA FINAL (GAME OVER) ---
    if (gameState === 'gameover') {
        const totalRecycled = stats.plastic_bottle + stats.aluminum_can + stats.paper + stats.cardboard + stats.container

        return (
            <div className="ui-overlay menu-overlay">
                <div className="menu-card glass gameover-card">
                    <h1>Misión Finalizada</h1>
                    
                    <div className="score-badge">
                        <span className="badge-label">Impacto Ambiental Neto</span>
                        <span className="badge-value">{score} pts</span>
                    </div>

                    <p className="gameover-message">
                        ¡Gracias! Has recolectado un total de <strong>{totalRecycled}</strong> residuos reciclables y has contribuido a reducir la contaminación ambiental en la ciudad de Huancayo.
                    </p>

                    <div className="stats-grid">
                        <h3>Resumen de Recolección</h3>
                        <div className="stats-list">
                            <div className="stat-item">
                                <span>🥤 Botellas recicladas:</span>
                                <strong>{stats.plastic_bottle}</strong>
                            </div>
                            <div className="stat-item">
                                <span>🥫 Latas recicladas:</span>
                                <strong>{stats.aluminum_can}</strong>
                            </div>
                            <div className="stat-item">
                                <span>📄 Papel reciclado:</span>
                                <strong>{stats.paper}</strong>
                            </div>
                            <div className="stat-item">
                                <span>📦 Cartón reciclado:</span>
                                <strong>{stats.cardboard}</strong>
                            </div>
                            <div className="stat-item">
                                <span>🥛 Envases reciclados:</span>
                                <strong>{stats.container}</strong>
                            </div>
                            <div className="stat-item danger">
                                <span>⚠️ Residuos peligrosos tocados:</span>
                                <strong>{stats.hazardous}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Logros Obtenidos */}
                    {unlockedAchievements.length > 0 && (
                        <div className="achievements-summary">
                            <h3>Logros Desbloqueados</h3>
                            <div className="achievements-badges">
                                {unlockedAchievements.map(id => {
                                    const ach = ACHIEVEMENTS.find(a => a.id === id)
                                    return ach ? (
                                        <div key={id} className="badge-item" title={ach.description}>
                                            <span className="badge-icon">{ach.icon}</span>
                                            <span className="badge-name">{ach.name}</span>
                                        </div>
                                    ) : null
                                })}
                            </div>
                        </div>
                    )}

                    {/* Dato Ambiental Educativo */}
                    <div className="fact-box">
                        <span className="fact-title">💡 ¿Sabías que?</span>
                        <p className="fact-text">{lastFact}</p>
                    </div>

                    <button className="btn-primary" onClick={reset}>
                        Volver al Menú
                    </button>
                </div>
            </div>
        )
    }

    // --- INTERFAZ DURANTE LA PARTIDA (GAMEPLAY) ---
    return (
        <>
            {/* Destello de pantalla al impactar (verde/rojo) */}
            <div className={`screen-flash ${flashColor || ''}`} />

            <div className="ui-overlay gameplay-overlay">
                {/* Barra superior de información */}
                <div className="top-bar glass">
                    <div className="hud-metric">
                        <span className="metric-icon">🌱</span>
                        <div className="metric-content">
                            <span className="metric-label">Impacto Ambiental</span>
                            <span className="metric-value">{score}</span>
                        </div>
                    </div>
                    <div className="hud-metric">
                        <span className="metric-icon">⏱️</span>
                        <div className="metric-content">
                            <span className="metric-label">Tiempo restante</span>
                            <span className="metric-value">{timeLeft}s</span>
                        </div>
                    </div>
                </div>

                {/* Notificación de logro desbloqueado en tiempo real */}
                <div className={`achievement-toast glass ${showAchievementNotify ? 'show' : ''}`}>
                    {latestAchievement && (
                        <>
                            <span className="toast-icon">{latestAchievement.icon}</span>
                            <div className="toast-content">
                                <span className="toast-title">¡Logro Desbloqueado!</span>
                                <span className="toast-name">{latestAchievement.name}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Tarjeta Educativa Elegante (Modo Huancayo) */}
                <div className={`educational-card glass ${showCard ? 'show' : ''}`}>
                    <span className="card-icon">🏛️ Huancayo Limpio:</span>
                    <p className="card-text">{currentCard}</p>
                </div>

                {/* Retícula de Escaneo y Recolección (Aspecto Tecnológico/Profesional) */}
                <div className="scan-reticle">
                    <div className="reticle-circle">
                        <div className="reticle-dot" />
                    </div>
                    <span className="reticle-text">ESCANEAR Y RECOLECTAR</span>
                </div>
            </div>
        </>
    )
}
