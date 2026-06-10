import { useEffect, useState, useRef } from 'react'
import { useGameStore, LEVELS, getRankName, ACHIEVEMENTS } from '../store/gameStore'

interface HUDProps {
    onStartAR?: () => void
    isDemoMode?: boolean
}

const CINEMATIC_SLIDES = [
    {
        icon: "🏢🌇",
        title: "El Colapso de la Incontrastable",
        text: "Huancayo, la histórica ciudad de los Andes centrales, sufre bajo una crisis silenciosa. Diariamente se acumulan toneladas de plásticos y cartones en sus avenidas, dañando su belleza natural.",
        color: "#10b981"
    },
    {
        icon: "🌊💀",
        title: "El Mantaro en Peligro",
        text: "Nuestra fuente de vida, el majestuoso Río Mantaro, está siendo asfixiado. La basura plástica y los derrames de insumos químicos industriales destruyen su biodiversidad y amenazan a toda la región.",
        color: "#ef4444"
    },
    {
        icon: "🛡️🌲",
        title: "La Unidad de Élite Ambiental",
        text: "Para mitigar este desastre ecológico, la Universidad ha movilizado una unidad científica de respuesta inmediata. El objetivo: erradicar los focos de contaminación mediante tecnología molecular.",
        color: "#0ea5e9"
    },
    {
        icon: "🔍🔋",
        title: "El EcoScanner 3000",
        text: "Como agente líder, se te confía el EcoScanner 3000. Este dispositivo de realidad aumentada escanea y segrega residuos moleculares para reciclarlos al instante. ¡Pero cuidado con los reactivos químicos!",
        color: "#fbbf24"
    },
    {
        icon: "🌎🚀",
        title: "Llamado a la Acción",
        text: "Tu patrullaje inicia ahora. Recorrerás calles, parques y el cauce del río hasta erradicar los residuos. Mantén el foco, encadena combos de segregación y salva a Huancayo de la emergencia ambiental.",
        color: "#34d399"
    }
]

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
        nextLevel,
        
        // Nuevas variables
        comboCount,
        comboMultiplier,
        maxCombo,
        goldenScannedTotal,
        goldenScannedInLevel,
        levelStars,
        sideQuestCompleted,
        hazardousHitsInLevel,
        consecutiveBottles,
        bossHp,
        bossMaxHp,
        bossActive,
        skipCinematic
    } = useGameStore()

    // Estado local para navegar la cinemática
    const [slideIndex, setSlideIndex] = useState(0)

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
        if (gameState === 'menu' || gameState === 'level_intro' || gameState === 'cinematic') {
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

    // Avanzar cinemática
    const handleNextSlide = () => {
        if (slideIndex < CINEMATIC_SLIDES.length - 1) {
            setSlideIndex(prev => prev + 1)
        } else {
            setSlideIndex(0)
            skipCinematic()
        }
    }

    // --- PANTALLA 0: INTRODUCCIÓN CINEMÁTICA ---
    if (gameState === 'cinematic') {
        const slide = CINEMATIC_SLIDES[slideIndex]
        return (
            <div className="ui-overlay menu-overlay">
                <div className="menu-card glass cinematic-card" style={{ borderLeft: `5px solid ${slide.color}` }}>
                    <button className="btn-skip" onClick={skipCinematic}>
                        Omitir Cinemática ⏩
                    </button>
                    
                    <div className="cinematic-icon" style={{ fontSize: '4rem', filter: `drop-shadow(0 4px 8px ${slide.color}50)` }}>
                        {slide.icon}
                    </div>
                    
                    <h2 className="cinematic-title" style={{ color: slide.color }}>
                        {slide.title}
                    </h2>
                    
                    <p className="cinematic-text">
                        {slide.text}
                    </p>
                    
                    <div className="cinematic-dots">
                        {CINEMATIC_SLIDES.map((_, i) => (
                            <span key={i} className={`dot ${i === slideIndex ? 'active' : ''}`} style={{ backgroundColor: i === slideIndex ? slide.color : 'rgba(255,255,255,0.2)' }} />
                        ))}
                    </div>
                    
                    <button className="btn-primary" onClick={handleNextSlide} style={{ background: `linear-gradient(135deg, ${slide.color} 0%, #0ea5e9 100%)` }}>
                        {slideIndex === CINEMATIC_SLIDES.length - 1 ? '¡Comenzar Operación! 🚀' : 'Continuar ➡️'}
                    </button>
                </div>
            </div>
        )
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
                        <h3>Misiones del Agente Ambiental:</h3>
                        <ul>
                            <li>🟢 Segrega plástico, latas, papel, cartón y envases (+puntos con combos).</li>
                            <li>🔴 Evita pilas, baterías y químicos peligrosos (restan -500 puntos).</li>
                            <li>⚡ Captura residuos dorados temporales (+500 puntos base).</li>
                            <li>💀 Derrota al Mega Contenedor Tóxico en la batalla final del Nivel 4.</li>
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
                            <span style={{ color: '#fbbf24', marginTop: '6px', fontSize: '0.85rem' }}>🌟 Misión Secundaria: <strong>{currentLevelConfig.sideQuestTitle}</strong></span>
                            <span style={{ color: '#cbd5e1', fontSize: '0.8rem', paddingLeft: '14px' }}>{currentLevelConfig.sideQuestDesc}</span>
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
        const stars = levelStars[level - 1] || 1

        return (
            <div className="ui-overlay menu-overlay">
                <div className="menu-card glass">
                    <span className="victory-icon">🎉</span>
                    <h1 className="victory-title">¡Nivel Completado!</h1>
                    <p className="subtitle">Completaste con éxito la limpieza de: <strong>{currentLevelConfig.name}</strong></p>

                    {/* Sistema de Estrellas */}
                    <div className="star-rating">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <span key={i} className={`star-icon ${i < stars ? 'star-active' : 'star-inactive'}`}>★</span>
                        ))}
                    </div>

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
                                <span>🌟 Misión Secundaria:</span>
                                <strong style={{ color: sideQuestCompleted ? '#4ade80' : '#f87171' }}>
                                    {sideQuestCompleted ? '¡COMPLETADA! (+300 pts / +30 XP)' : 'No completada'}
                                </strong>
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

        // Calcular porcentaje para la barra de progreso final (basado en XP max 1200 por logros nuevos)
        const xpProgress = Math.min(100, (xp / 1200) * 100)

        return (
            <div className="ui-overlay menu-overlay">
                <div className="menu-card glass gameover-card">
                    <div className="fireworks-celebration">🏆🌎✨</div>
                    <h1 className="campaign-victory-title">¡CAMPAÑA COMPLETADA!</h1>
                    <p className="subtitle" style={{ color: '#4ade80', fontWeight: 'bold' }}>
                        ¡Has salvado al Río Mantaro y limpiado la ciudad de Huancayo!
                    </p>

                    {/* Resumen de Estrellas de toda la Campaña */}
                    <div className="campaign-stars-summary">
                        <h3>Estrellas de la Campaña</h3>
                        <div className="stars-grid-summary">
                            {LEVELS.map((lvl, index) => (
                                <div key={lvl.level} className="star-level-row">
                                    <span>Nivel {lvl.level}: {lvl.name}</span>
                                    <div className="star-rating-small">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <span key={i} className={`star-icon-small ${i < (levelStars[index] || 0) ? 'star-active' : 'star-inactive'}`}>★</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rank-showcase" style={{ marginTop: '14px' }}>
                        <span className="rank-title">Rango de Agente Ambiental</span>
                        <span className="rank-value">{rank}</span>
                        <div className="xp-progress-bar-wrap">
                            <div className="xp-progress-bar" style={{ width: `${xpProgress}%` }} />
                        </div>
                        <span className="xp-text">{xp} XP</span>
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
                            <div className="stat-item" style={{ color: '#fbbf24' }}>
                                <span>🪙 Residuos dorados capturados:</span>
                                <strong>{goldenScannedTotal}</strong>
                            </div>
                            <div className="stat-item" style={{ color: '#38bdf8' }}>
                                <span>🔥 Récord de Combo consecutivo:</span>
                                <strong>{maxCombo}</strong>
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
                        <p>
                            "¡Gracias por tu valor ecológico! El Río Mantaro y la ciudad de Huancayo respiran mejor gracias a tu destreza con el EcoScanner 3000. Eres oficialmente un Guardián Ecoalcalde."
                        </p>
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

    // Construcción del texto de progreso de la misión secundaria
    const renderSideQuestStatus = () => {
        if (sideQuestCompleted) {
            return <span style={{ color: '#4ade80', fontWeight: 'bold' }}>⭐ {currentLevelConfig.sideQuestTitle}: ¡COMPLETADA!</span>
        }
        
        let progressText = ''
        if (level === 1) {
            progressText = `${consecutiveBottles} / 3 botellas plásticas consecutivas`
        } else if (level === 2) {
            progressText = hazardousHitsInLevel > 0 ? '❌ Fallida (Daño recibido)' : '✅ Activa (Sin daño)'
        } else if (level === 3) {
            progressText = `Multiplicador actual: x${comboMultiplier} / x5`
        } else if (level === 4) {
            progressText = `${goldenScannedInLevel} / 2 dorados capturados`
        }

        return (
            <div className="side-quest-hud-indicator">
                <span className="sq-label">🌟 MISION SECUNDARIA: {currentLevelConfig.sideQuestTitle}</span>
                <span className="sq-progress">{progressText}</span>
            </div>
        )
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
                            <span className="metric-value">
                                {recycledInLevel} / {currentLevelConfig.goal}
                            </span>
                        </div>
                    </div>

                    <div className={`hud-metric-timer ${timerClass}`}>
                        <span className="timer-icon">⏱️</span>
                        <span className="timer-text">{Math.ceil(timeLeft)}s</span>
                    </div>
                </div>

                {/* Barra de Vida del Jefe (si está activo en Nivel 4) */}
                {bossActive && (
                    <div className="boss-health-container glass">
                        <div className="boss-health-header">
                            <span className="boss-name">💀 REACTOR TÓXICO FINAL</span>
                            <span className="boss-hp-value">{bossHp} / {bossMaxHp} HP</span>
                        </div>
                        <div className="boss-health-bar">
                            <div className="boss-health-fill" style={{ width: `${(bossHp / bossMaxHp) * 100}%` }} />
                        </div>
                    </div>
                )}

                {/* Indicador de Combo y Misión Secundaria en la parte inferior */}
                <div className="hud-bottom-overlay">
                    {/* Indicador de Misión Secundaria */}
                    <div className="side-quest-panel glass">
                        {renderSideQuestStatus()}
                    </div>

                    {/* Combo Badge */}
                    {comboCount >= 3 && (
                        <div className={`combo-badge multiplier-x${comboMultiplier}`}>
                            <span className="combo-fire">🔥</span>
                            <span className="combo-value">COMBO x{comboMultiplier}</span>
                            <span className="combo-hits">({comboCount} seguidos)</span>
                        </div>
                    )}
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
                    <span className="reticle-text">
                        {bossActive ? '🎯 APUNTA AL REACTOR' : 'ECOSCANNER 3000'}
                    </span>
                </div>
            </div>
        </>
    )
}
