import { create } from 'zustand'

export type GameState = 'cinematic' | 'menu' | 'level_intro' | 'playing' | 'level_completed' | 'gameover' | 'campaign_completed'

export interface GameStats {
    plastic_bottle: number
    aluminum_can: number
    paper: number
    cardboard: number
    container: number
    hazardous: number
}

export interface Achievement {
    id: string
    name: string
    description: string
    icon: string
}

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_recycle', name: 'Primer Reciclaje', description: '¡Reciclaste tu primer residuo!', icon: '🌱' },
    { id: 'recycle_10', name: '10 Residuos Reciclados', description: 'Reciclaste 10 residuos en total', icon: '♻️' },
    { id: 'recycle_50', name: '50 Residuos Reciclados', description: 'Reciclaste 50 residuos en total', icon: '🧹' },
    { id: 'recycle_100', name: '100 Residuos Reciclados', description: 'Reciclaste 100 residuos en total', icon: '🌎' },
    { id: 'mantaro_protector', name: 'Protector del Río Mantaro', description: 'Completaste con éxito el nivel del Río Mantaro', icon: '🌊' },
    
    // Logros Avanzados
    { id: 'combo_master', name: 'Maestro de Combos', description: 'Alcanza un multiplicador de Combo x10', icon: '🔥' },
    { id: 'gold_hunter', name: 'Cazador de Oro', description: 'Escanea 5 residuos dorados en total', icon: '🪙' },
    { id: 'perfect_agent', name: 'Agente Perfecto', description: 'Completa cualquier nivel con 3 estrellas', icon: '⭐' },
    { id: 'boss_slayer', name: 'Héroe del Mantaro', description: 'Derrotaste al Mega Contenedor Tóxico (Jefe Final)', icon: '☠️' }
]

export interface LevelConfig {
    level: number
    name: string
    story: string
    difficulty: string
    maxTargets: number
    pctRecyclable: number
    goal: number
    fact: string
    sideQuestTitle: string
    sideQuestDesc: string
}

export const LEVELS: LevelConfig[] = [
    {
        level: 1,
        name: "Calles Limpias",
        story: "La ciudad necesita tu ayuda para comenzar el proceso de reciclaje en las avenidas céntricas de Huancayo.",
        difficulty: "Fácil",
        maxTargets: 15,
        pctRecyclable: 0.90,
        goal: 10,
        fact: "Una botella plástica puede tardar cientos de años en degradarse. ¡Reciclarla evita que contamine nuestras calles!",
        sideQuestTitle: "Especialista en Botellas",
        sideQuestDesc: "Recicla 3 botellas plásticas seguidas."
    },
    {
        level: 2,
        name: "Parques Verdes",
        story: "Los pulmones urbanos como el Parque de la Identidad Huanca deben mantenerse limpios para las familias.",
        difficulty: "Media",
        maxTargets: 22,
        pctRecyclable: 0.80,
        goal: 20,
        fact: "El reciclaje de papel y cartón salva millones de árboles y mantiene nuestros parques hermosos.",
        sideQuestTitle: "Ecosistema Intacto",
        sideQuestDesc: "Completa la misión sin recibir daño de tóxicos."
    },
    {
        level: 3,
        name: "Rescate del Río Mantaro",
        story: "La corriente arrastra gran cantidad de plásticos. Evita que la contaminación avance río abajo.",
        difficulty: "Difícil",
        maxTargets: 30,
        pctRecyclable: 0.75,
        goal: 30,
        fact: "El Río Mantaro es vital para la agricultura y energía de la región. Salvarlo es tarea de todos.",
        sideQuestTitle: "Súper Combo",
        sideQuestDesc: "Logra un multiplicador de Combo x5."
    },
    {
        level: 4,
        name: "Emergencia Ambiental",
        story: "Un foco crítico de contaminación industrial amenaza la cuenca. ¡Prepárate para contener el desastre!",
        difficulty: "Experto",
        maxTargets: 40,
        pctRecyclable: 0.70,
        goal: 40,
        fact: "Las baterías y pilas contienen metales pesados como plomo y mercurio que envenenan la tierra y el agua.",
        sideQuestTitle: "Fiebre del Oro",
        sideQuestDesc: "Recolecta al menos 2 residuos dorados."
    }
]

export const getRankName = (xp: number): string => {
    if (xp < 100) return "Aprendiz Ambiental"
    if (xp < 300) return "Reciclador Urbano"
    if (xp < 600) return "Protector Ecológico"
    if (xp < 1000) return "Guardián del Mantaro"
    return "Héroe Ambiental"
}

interface GameStore {
    score: number // Puntos de Impacto Ambiental
    timeLeft: number
    gameState: GameState
    stats: GameStats
    unlockedAchievements: string[]
    flashColor: 'green' | 'red' | null

    // Campaña y Progresión
    level: number
    recycledInLevel: number
    totalRecycled: number
    xp: number

    // Nuevas características
    comboCount: number
    comboMultiplier: number
    maxCombo: number
    goldenScannedTotal: number
    goldenScannedInLevel: number
    levelStars: number[]
    sideQuestCompleted: boolean
    sideQuestProgress: number
    hazardousHitsInLevel: number
    consecutiveBottles: number
    bossHp: number
    bossMaxHp: number
    bossActive: boolean
    hasBeatenBoss: boolean

    skipCinematic: () => void
    startCampaign: () => void
    startGame: () => void // Wrapper para compatibilidad
    startLevel: () => void
    endGame: () => void
    addScore: (points: number) => void
    recycleItem: (type: string, isGolden?: boolean) => void
    hitHazardous: (type: string) => void
    hitBoss: (damage: number) => void
    calculateLevelStars: (hazHits: number, timeLeft: number) => number
    tickTimer: (delta: number) => void
    nextLevel: () => void
    reset: () => void
}

const initialStats: GameStats = {
    plastic_bottle: 0,
    aluminum_can: 0,
    paper: 0,
    cardboard: 0,
    container: 0,
    hazardous: 0
}

export const useGameStore = create<GameStore>((set, get) => ({
    score: 0,
    timeLeft: 60,
    gameState: 'cinematic',
    stats: { ...initialStats },
    unlockedAchievements: [],
    flashColor: null,

    level: 1,
    recycledInLevel: 0,
    totalRecycled: 0,
    xp: 0,

    // Nuevas variables
    comboCount: 0,
    comboMultiplier: 1,
    maxCombo: 0,
    goldenScannedTotal: 0,
    goldenScannedInLevel: 0,
    levelStars: [0, 0, 0, 0],
    sideQuestCompleted: false,
    sideQuestProgress: 0,
    hazardousHitsInLevel: 0,
    consecutiveBottles: 0,
    bossHp: 10,
    bossMaxHp: 10,
    bossActive: false,
    hasBeatenBoss: false,

    skipCinematic: () => set({ gameState: 'menu' }),

    startCampaign: () => set({
        gameState: 'level_intro',
        level: 1,
        recycledInLevel: 0,
        totalRecycled: 0,
        xp: 0,
        score: 0,
        stats: { ...initialStats },
        unlockedAchievements: [],
        flashColor: null,
        timeLeft: 60,
        comboCount: 0,
        comboMultiplier: 1,
        maxCombo: 0,
        goldenScannedTotal: 0,
        goldenScannedInLevel: 0,
        levelStars: [0, 0, 0, 0],
        sideQuestCompleted: false,
        sideQuestProgress: 0,
        hazardousHitsInLevel: 0,
        consecutiveBottles: 0,
        bossHp: 10,
        bossActive: false,
        hasBeatenBoss: false
    }),

    startGame: () => {
        get().startCampaign()
    },

    startLevel: () => set({
        gameState: 'playing',
        timeLeft: 60,
        recycledInLevel: 0,
        comboCount: 0,
        comboMultiplier: 1,
        goldenScannedInLevel: 0,
        sideQuestCompleted: false,
        sideQuestProgress: 0,
        hazardousHitsInLevel: 0,
        consecutiveBottles: 0,
        bossHp: 10,
        bossActive: false
    }),

    endGame: () => set({ gameState: 'gameover' }),

    addScore: (points) => set((state) => ({ score: state.score + points })),

    recycleItem: (type, isGolden = false) => set((state) => {
        const key = type as keyof GameStats
        const newStats = { ...state.stats }
        if (key in newStats) {
            newStats[key] = (newStats[key] || 0) + 1
        }

        // Lógica de Combos
        const newComboCount = state.comboCount + 1
        let newComboMultiplier = 1
        if (newComboCount >= 10) newComboMultiplier = 10
        else if (newComboCount >= 6) newComboMultiplier = 5
        else if (newComboCount >= 3) newComboMultiplier = 2

        const newMaxCombo = Math.max(state.maxCombo, newComboCount)

        // Sumas de puntaje y XP
        const baseScore = isGolden ? 500 : 100
        const pointsAdded = baseScore * newComboMultiplier
        const newScore = state.score + pointsAdded

        const baseXP = isGolden ? 50 : 10
        const newXp = state.xp + baseXP

        const newRecycledInLevel = state.recycledInLevel + 1
        const newTotalRecycled = state.totalRecycled + 1

        const currentLevelConfig = LEVELS[state.level - 1]

        // Control de Residuos Dorados
        let newGoldenScannedTotal = state.goldenScannedTotal
        let newGoldenScannedInLevel = state.goldenScannedInLevel
        if (isGolden) {
            newGoldenScannedTotal += 1
            newGoldenScannedInLevel += 1
        }

        // Lógica de Misión Secundaria por Nivel
        let newSideQuestCompleted = state.sideQuestCompleted
        let newSideQuestProgress = state.sideQuestProgress
        let newConsecutiveBottles = state.consecutiveBottles

        if (!newSideQuestCompleted) {
            if (state.level === 1) {
                // Especialista en Botellas: 3 plásticos seguidos
                if (type === 'plastic_bottle') {
                    newConsecutiveBottles += 1
                    newSideQuestProgress = newConsecutiveBottles
                    if (newConsecutiveBottles >= 3) {
                        newSideQuestCompleted = true
                    }
                } else {
                    newConsecutiveBottles = 0
                    newSideQuestProgress = 0
                }
            } else if (state.level === 3) {
                // Súper Combo: combo x5
                newSideQuestProgress = Math.max(newSideQuestProgress, newComboMultiplier)
                if (newComboMultiplier >= 5) {
                    newSideQuestCompleted = true
                }
            } else if (state.level === 4) {
                // Fiebre del oro: 2 dorados
                newSideQuestProgress = newGoldenScannedInLevel
                if (newGoldenScannedInLevel >= 2) {
                    newSideQuestCompleted = true
                }
            }
        }

        // Programar la recompensa inmediata de misión secundaria si acaba de completarse
        let finalScore = newScore
        let finalXp = newXp
        if (newSideQuestCompleted && !state.sideQuestCompleted) {
            finalScore += 300
            finalXp += 30
        }

        // Logros y Medallas
        const newAchievements = [...state.unlockedAchievements]
        if (newTotalRecycled >= 1 && !newAchievements.includes('first_recycle')) {
            newAchievements.push('first_recycle')
        }
        if (newTotalRecycled >= 10 && !newAchievements.includes('recycle_10')) {
            newAchievements.push('recycle_10')
        }
        if (newTotalRecycled >= 50 && !newAchievements.includes('recycle_50')) {
            newAchievements.push('recycle_50')
        }
        if (newTotalRecycled >= 100 && !newAchievements.includes('recycle_100')) {
            newAchievements.push('recycle_100')
        }
        if (newComboMultiplier >= 10 && !newAchievements.includes('combo_master')) {
            newAchievements.push('combo_master')
        }
        if (newGoldenScannedTotal >= 5 && !newAchievements.includes('gold_hunter')) {
            newAchievements.push('gold_hunter')
        }

        // Limpiar destello de pantalla
        setTimeout(() => {
            useGameStore.setState({ flashColor: null })
        }, 200)

        // Control de Jefe Final en Nivel 4
        let newBossActive = state.bossActive
        let nextState: GameState = state.gameState

        if (state.level === 4 && newRecycledInLevel >= 20 && !state.hasBeatenBoss && !state.bossActive) {
            newBossActive = true
        }

        // Verificar fin de nivel (sin jefe)
        const isGoalMet = newRecycledInLevel >= currentLevelConfig.goal
        
        // Si no hay jefe activo o el jefe ya fue derrotado, se puede avanzar de nivel
        if (isGoalMet && (!newBossActive || state.hasBeatenBoss)) {
            // Calcular estrellas obtenidas en este nivel
            const stars = get().calculateLevelStars(state.hazardousHitsInLevel, state.timeLeft)
            const newLevelStars = [...state.levelStars]
            newLevelStars[state.level - 1] = stars

            if (stars === 3 && !newAchievements.includes('perfect_agent')) {
                newAchievements.push('perfect_agent')
            }

            if (state.level === 3 && !newAchievements.includes('mantaro_protector')) {
                newAchievements.push('mantaro_protector')
            }

            if (state.level >= LEVELS.length) {
                nextState = 'campaign_completed'
            } else {
                nextState = 'level_completed'
            }

            return {
                score: finalScore,
                stats: newStats,
                recycledInLevel: newRecycledInLevel,
                totalRecycled: newTotalRecycled,
                xp: finalXp,
                unlockedAchievements: newAchievements,
                flashColor: 'green',
                gameState: nextState,
                comboCount: newComboCount,
                comboMultiplier: newComboMultiplier,
                maxCombo: newMaxCombo,
                goldenScannedTotal: newGoldenScannedTotal,
                goldenScannedInLevel: newGoldenScannedInLevel,
                sideQuestCompleted: newSideQuestCompleted,
                sideQuestProgress: newSideQuestProgress,
                consecutiveBottles: newConsecutiveBottles,
                levelStars: newLevelStars
            }
        }

        return {
            score: finalScore,
            stats: newStats,
            recycledInLevel: newRecycledInLevel,
            totalRecycled: newTotalRecycled,
            xp: finalXp,
            unlockedAchievements: newAchievements,
            flashColor: 'green',
            gameState: nextState,
            comboCount: newComboCount,
            comboMultiplier: newComboMultiplier,
            maxCombo: newMaxCombo,
            goldenScannedTotal: newGoldenScannedTotal,
            goldenScannedInLevel: newGoldenScannedInLevel,
            sideQuestCompleted: newSideQuestCompleted,
            sideQuestProgress: newSideQuestProgress,
            consecutiveBottles: newConsecutiveBottles,
            bossActive: newBossActive
        }
    }),

    hitHazardous: () => set((state) => {
        const newStats = { ...state.stats }
        newStats.hazardous = (newStats.hazardous || 0) + 1

        const newHazardousHits = state.hazardousHitsInLevel + 1

        setTimeout(() => {
            useGameStore.setState({ flashColor: null })
        }, 200)

        return {
            score: Math.max(0, state.score - 500),
            stats: newStats,
            flashColor: 'red',
            comboCount: 0,
            comboMultiplier: 1,
            consecutiveBottles: 0,
            sideQuestProgress: state.level === 1 ? 0 : state.sideQuestProgress,
            hazardousHitsInLevel: newHazardousHits
        }
    }),

    hitBoss: (damage) => set((state) => {
        const newHp = Math.max(0, state.bossHp - damage)
        
        setTimeout(() => {
            useGameStore.setState({ flashColor: null })
        }, 1200)

        if (newHp <= 0) {
            // Jefe Derrotado! Recompensa final masiva
            const finalScore = state.score + 2000
            const finalXp = state.xp + 200

            const newAchievements = [...state.unlockedAchievements]
            if (!newAchievements.includes('boss_slayer')) {
                newAchievements.push('boss_slayer')
            }

            // Calcular estrellas
            const stars = get().calculateLevelStars(state.hazardousHitsInLevel, state.timeLeft)
            const newLevelStars = [...state.levelStars]
            newLevelStars[state.level - 1] = stars

            if (stars === 3 && !newAchievements.includes('perfect_agent')) {
                newAchievements.push('perfect_agent')
            }

            return {
                bossHp: 0,
                bossActive: false,
                hasBeatenBoss: true,
                score: finalScore,
                xp: finalXp,
                unlockedAchievements: newAchievements,
                levelStars: newLevelStars,
                gameState: 'campaign_completed',
                flashColor: 'green'
            }
        }

        return {
            bossHp: newHp,
            flashColor: 'green' // Flash verde por impacto exitoso ecológico
        }
    }),

    calculateLevelStars: (hazHits: number, timeLeft: number) => {
        // Misión secundaria Nivel 2: Completar sin daño de tóxicos
        // Si el nivel es 2, y no hay golpes tóxicos, completamos la misión secundaria al finalizar el nivel
        // Esto se gatilla automáticamente aquí para simplificar.
        const state = get()
        if (state.level === 2 && hazHits === 0 && !state.sideQuestCompleted) {
            set((prev) => ({
                sideQuestCompleted: true,
                score: prev.score + 300,
                xp: prev.xp + 30
            }))
        }

        if (hazHits === 0 && timeLeft >= 15) return 3
        if (hazHits <= 2) return 2
        return 1
    },

    tickTimer: (delta) => set((state) => {
        const newTime = state.timeLeft - delta
        if (newTime <= 0) {
            return { timeLeft: 0, gameState: 'gameover' }
        }
        return { timeLeft: newTime }
    }),

    nextLevel: () => set((state) => {
        const nextLvl = state.level + 1
        if (nextLvl > LEVELS.length) {
            return { gameState: 'campaign_completed' }
        }
        return {
            level: nextLvl,
            gameState: 'level_intro',
            recycledInLevel: 0,
            comboCount: 0,
            comboMultiplier: 1,
            goldenScannedInLevel: 0,
            sideQuestCompleted: false,
            sideQuestProgress: 0,
            hazardousHitsInLevel: 0,
            consecutiveBottles: 0,
            bossHp: 10,
            bossActive: false
        }
    }),

    reset: () => set({
        gameState: 'menu',
        score: 0,
        timeLeft: 60,
        stats: { ...initialStats },
        unlockedAchievements: [],
        level: 1,
        recycledInLevel: 0,
        totalRecycled: 0,
        xp: 0,
        comboCount: 0,
        comboMultiplier: 1,
        maxCombo: 0,
        goldenScannedTotal: 0,
        goldenScannedInLevel: 0,
        levelStars: [0, 0, 0, 0],
        sideQuestCompleted: false,
        sideQuestProgress: 0,
        hazardousHitsInLevel: 0,
        consecutiveBottles: 0,
        bossHp: 10,
        bossActive: false,
        hasBeatenBoss: false
    })
}))
