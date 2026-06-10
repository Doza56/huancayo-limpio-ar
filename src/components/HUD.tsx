import { useEffect, useState, useRef } from 'react'
import { useGameStore, LEVELS, getRankName, ACHIEVEMENTS } from '../store/gameStore'

interface HUDProps {
    onStartAR?: () => void
    isDemoMode?: boolean
}

export function HUD({ onStartAR, isDemoMode = false }: HUDProps) {
    const {
        score,
        timeLeft,
        gameState,
        stats,
        unlockedAchievements,
        flashColor,
        level,
        recycledInLevel,
        xp,
        tickTimer,
        reset,
        startCampaign,
        startLevel,
        nextLevel
    } = useGameStore()

    // Estado para notificaciones de logros en tiempo real
    const [latestAchievement, setLatestAchievement] = useState<{ name: string; description: string; icon: string } | null>(null)
    const [showAchievementNotify, setShowAchievementNotify] = useState(false)
    const prevAchievementsCount = useRef(0)

    // Temporizador principal del juego
    useEffect(() => {
        if (gameState === 'playing') {
            const interval = setInterval(() => {
                tickTimer(1)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [gameState, tickTimer])

    // Notificaciones de logros
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
        if (gameState === 'menu' || gameState === 'level_intro') {
            prevAchievementsCount.current = unlockedAchievements.length
        }
    }, [unlockedAchievements, gameState])

    const currentLevelConfig = LEVELS[level - 1] || LEVELS[0]

    // Manejar el botón de iniciar el nivel
    const handleStartLevelClick = () => {
        startLevel()
        if (onStartAR && !isDemoMode) {
            onStartAR() // Iniciar sesión WebXR en móvil
        }
    }

    // --- PANTALLA 1: MENÚ DE INICIO ---
    if (gameState === 'menu') {
        return (
            <div className="ui-overlay menu-overlay">
                <div className="menu-card glass">
                    <div className="logo-container">
                        <span className="logo-icon">🌎</span>
                        <h1>HUANCAYO LIMPIO AR</h1>
                        <span className="campaign-subtitle">Misión Mantaro</span>
                    </div>
                    <p className="subtitle">
                        {isDemoMode
                            ? 'Modo demostración en escritorio. Usa el mouse para rotar la vista y haz clic para capturar los residuos.'
                            : 'Utiliza realidad aumentada para limpiar virtualmente la ciudad de Huancayo, salvar el Río Mantaro y aprender a reciclar.'}
                    </p>
                    {isDemoMode && (
                        <div className="demo-mode-notice">
                            🖥️ <strong>Modo Demo Activo</strong> — Sin cámara AR. Haz clic para simular el escaneo ecológico.
                        </div>
                    )}
                    <div className="instructions">
                        <h3>Misión del Agente Ambiental:</h3>
                        <ul>
                            <li>🟢 Captura botellas, latas, papeles y cartones (+100 Impacto).</li>
                            <li>🔴 Evita tocar pilas, baterías o químicos peligrosos (-500 Impacto).</li>
                            <li>🧭 Completa los 4 niveles de la campaña y salva nuestro río.</li>
                        </ul>
                    </div>
                    <button className="btn-primary" onClick={startCampaign}>
                        Iniciar Campaña Ecológica 🚀
                    </button>
                </div>
            </div>
        )
    }

    // --- PANTALLA 2: INTRODUCCIÓN AL NIVEL (TARJETAS EDUCATIVAS) ---
    if (gameState === 'level_intro') {
        return (
            <div className="ui-overlay menu-overlay">
                <div className="menu-card glass">
                    <span className="level-badge">NIVEL {level}</span>
                    <h2 className="level-title-large">{currentLevelConfig.name}</h2>
                    <span className={`diff-badge ${currentLevelConfig.difficulty.toLowerCase()}`}>
                        Dificultad: {currentLevelConfig.difficulty}
                    </span>

                    <p className="level-story-text">
                        "{currentLevelConfig.story}"
                    </p>

                    <div className="educational-fact-intro">
                        <span className="edu-title">💡 DATO AMBIENTAL CLAVE</span>
                        <p className="edu-text">{currentLevelConfig.fact}</p>
                    </div>

                    <div className="level-requirements">
                        <span className="req-title">Objetivos de la misión:</span>
                        <div className="req-details">
                            <span>🎯 Meta de segregación: <strong>{currentLevelConfig.goal} residuos</strong></span>
                            <span>📦 Capacidad del EcoScanner: <strong>{currentLevelConfig.maxTargets} simultáneos</strong></span>
                        </div>
                    </div>

                    <button className="btn-primary" onClick={handleStartLevelClick}>
                        {isDemoMode ? 'Comenzar Nivel ▶️' : 'Iniciar Escaneo AR 📷'}
                    </button>
                </div>
            </div>
        )
    }

    // --- PANTALLA 3: NIVEL COMPLETADO (TRANSICIÓN DE PROGRESO) ---
    if (gameState === 'level_completed') {
        const timeUsed = 60 - Math.ceil(timeLeft)

        return (
            <div className="ui-overlay menu-overlay">
                <div className="menu-card glass">
                    <span className="victory-icon">🎉</span>
                    <h1 className="victory-title">¡Nivel Completado!</h1>
                    <p className="subtitle">Completaste con éxito la limpieza de: <strong>{currentLevelConfig.name}</strong></p>

                    <div className="stats-grid">
                        <h3>Resultados del Nivel</h3>
                        <div className="stats-list">
                            <div className="stat-item">
                                <span>⏱️ Tiempo utilizado:</span>
                                <strong>{timeUsed} segundos</strong>
                            </div>
                            <div className="stat-item">
                                <span>♻️ Residuos reciclados:</span>
                                <strong>{recycledInLevel} / {currentLevelConfig.goal}</strong>
                            </div>
                            <div className="stat-item">
                                <span>⚡ Impacto ambiental neto:</span>
                                <strong>{score} pts</strong>
                            </div>
                            <div className="stat-item">
                                <span>✨ Rango alcanzado:</span>
                                <strong style={{ color: '#10b981' }}>{getRankName(xp)}</strong>
                            </div>
                        </div>
                    </div>

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

                    <button className="btn-primary" onClick={nextLevel}>
                        Siguiente Misión ➡️
                    </button>
                </div>
            </div>
        )
    }

    // --- PANTALLA 4: CAMPAÑA COMPLETADA (CRÉDITOS Y ESTADÍSTICAS FINAL) ---
    if (gameState === 'campaign_completed') {
        const rank = getRankName(xp)
        const totalCleaned = stats.plastic_bottle + stats.aluminum_can + stats.paper + stats.cardboard + stats.container

        // Calcular porcentaje para la barra de progreso final (basado en XP max 1000)
        const xpProgress = Math.min(100, (xp / 1000) * 100)

        return (
            <div className="ui-overlay menu-overlay">
                <div className="menu-card glass gameover-card">
                    <span className="victory-icon-large">🌎🏆</span>
                    <h1 className="campaign-victory-title">¡Misión Cumplida!</h1>
                    <p className="subtitle">¡Has salvado al Río Mantaro y limpiado la ciudad de Huancayo!</p>

                    <div className="rank-showcase">
                        <span className="rank-title">Rango de Agente Ambiental</span>
                        <span className="rank-value">{rank}</span>
                        <div className="xp-progress-bar-wrap">
                            <div className="xp-progress-bar" style={{ width: `${xpProgress}%` }} />
                        </div>
                        <span className="xp-text">{xp} / 1000 XP</span>
                    </div>

                    <div className="stats-grid">
                        <h3>Estadísticas Históricas de la Campaña</h3>
                        <div className="stats-list">
                            <div className="stat-item">
                                <span>🥤 Botellas plásticas:</span>
                                <strong>{stats.plastic_bottle}</strong>
                            </div>
                            <div className="stat-item">
                                <span>🥫 Latas de aluminio:</span>
                                <strong>{stats.aluminum_can}</strong>
                            </div>
                            <div className="stat-item">
                                <span>📄 Hojas de papel:</span>
                                <strong>{stats.paper}</strong>
                            </div>
                            <div className="stat-item">
                                <span>📦 Cajas de cartón:</span>
                                <strong>{stats.cardboard}</strong>
                            </div>
                            <div className="stat-item">
                                <span>🥛 Envases Tetra Pak:</span>
                                <strong>{stats.container}</strong>
                            </div>
                            <div className="stat-item danger">
                                <span>⚠️ Tóxicos colisionados:</span>
                                <strong>{stats.hazardous}</strong>
                            </div>
                            <div className="stat-item total">
                                <span>🏆 Total Residuos Reciclados:</span>
                                <strong>{totalCleaned}</strong>
                            </div>
                        </div>
                    </div>

                    {unlockedAchievements.length > 0 && (
                        <div className="achievements-summary">
                            <h3>Tus Insignias Logradas</h3>
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

                    <div className="congratulations-box">
                        <p>"Gracias por ayudar a construir un Huancayo más limpio y promover la cultura del reciclaje."</p>
                    </div>

                    <button className="btn-primary" onClick={reset}>
                        Volver al Menú Principal
                    </button>
                </div>
            </div>
        )
    }

    // --- PANTALLA 5: FIN DEL TIEMPO (GAME OVER) ---
    if (gameState === 'gameover') {
        return (
            <div className="ui-overlay menu-overlay">
                <div className="menu-card glass">
                    <span className="gameover-icon">⏱️❌</span>
                    <h1 className="gameover-title-large">Misión Incompleta</h1>
                    <p className="subtitle">Se agotó el tiempo de escaneo antes de cumplir la meta.</p>

                    <div className="stats-grid">
                        <h3>Progreso del Nivel {level}</h3>
                        <div className="stats-list">
                            <div className="stat-item">
                                <span>Residuos meta:</span>
                                <strong>{currentLevelConfig.goal}</strong>
                            </div>
                            <div className="stat-item">
                                <span>Residuos capturados:</span>
                                <strong>{recycledInLevel}</strong>
                            </div>
                            <div className="stat-item">
                                <span>Impacto final:</span>
                                <strong>{score} pts</strong>
                            </div>
                        </div>
                    </div>

                    <button className="btn-primary" onClick={startCampaign}>
                        Reintentar Campaña 🔄
                    </button>
                    <button className="btn-secondary" style={{ marginTop: '12px', width: '100%' }} onClick={reset}>
                        Menú Principal
                    </button>
                </div>
            </div>
        )
    }

    // --- PANTALLA 6: INTERFAZ ACTIVA DE JUEGO (GAMEPLAY HUD) ---
    // Clases del reloj de acuerdo con la urgencia del tiempo restante
    let timerClass = 'timer-normal'
    if (timeLeft <= 5) {
        timerClass = 'timer-critical'
    } else if (timeLeft <= 10) {
        timerClass = 'timer-countdown'
    } else if (timeLeft <= 30) {
        timerClass = 'timer-warning'
    }

    return (
        <>
            {/* Destello de pantalla por impacto */}
            <div className={`screen-flash ${flashColor || ''}`} />

            <div className="ui-overlay gameplay-overlay">
                {/* Barra superior de métricas */}
                <div className="top-bar glass">
                    <div className="hud-metric">
                        <span className="metric-icon">🌱</span>
                        <div className="metric-content">
                            <span className="metric-label">Impacto Neto (XP: {xp})</span>
                            <span className="metric-value">{score} <span className="hud-rank-label">({getRankName(xp)})</span></span>
                        </div>
                    </div>

                    <div className="hud-metric">
                        <span className="metric-icon">🎯</span>
                        <div className="metric-content">
                            <span className="metric-label">Meta Nivel {level}</span>
                            <span className="metric-value">{recycledInLevel} / {currentLevelConfig.goal}</span>
                        </div>
                    </div>

                    <div className={`hud-metric-timer ${timerClass}`}>
                        <span className="timer-icon">⏱️</span>
                        <span className="timer-text">{Math.ceil(timeLeft)}s</span>
                    </div>
                </div>

                {/* Toast de logros desbloqueados */}
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

                {/* Retícula del EcoScanner 3000 */}
                <div className="scan-reticle">
                    <div className="reticle-circle ecopolymer-pulse">
                        <div className="reticle-dot" />
                    </div>
                    <span className="reticle-text">ECOSCANNER 3000</span>
                </div>
            </div>
        </>
    )
}
