import { create } from 'zustand'

export type GameState = 'menu' | 'level_intro' | 'playing' | 'level_completed' | 'gameover' | 'campaign_completed'

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
    { id: 'mantaro_protector', name: 'Protector del Río Mantaro', description: 'Completaste con éxito el nivel del Río Mantaro', icon: '🌊' }
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
}

export const LEVELS: LevelConfig[] = [
    {
        level: 1,
        name: "Calles Limpias",
        story: "La ciudad necesita tu ayuda para comenzar el proceso de reciclaje.",
        difficulty: "Fácil",
        maxTargets: 8,
        pctRecyclable: 0.90,
        goal: 10,
        fact: "Una botella plástica puede tardar cientos de años en degradarse. ¡Reciclarla evita que contamine nuestras calles!"
    },
    {
        level: 2,
        name: "Parques Verdes",
        story: "Los espacios públicos deben mantenerse limpios para todos.",
        difficulty: "Media",
        maxTargets: 12,
        pctRecyclable: 0.80,
        goal: 20,
        fact: "El reciclaje de papel y cartón salva millones de árboles y mantiene nuestros parques hermosos."
    },
    {
        level: 3,
        name: "Rescate del Río Mantaro",
        story: "Los residuos están llegando al río. Debes detener la contaminación.",
        difficulty: "Difícil",
        maxTargets: 18,
        pctRecyclable: 0.75,
        goal: 30,
        fact: "El Río Mantaro es un recurso natural fundamental para la región. Evitemos que plásticos e insumos químicos destruyan su ecosistema."
    },
    {
        level: 4,
        name: "Emergencia Ambiental",
        story: "Una gran acumulación de residuos amenaza el entorno.",
        difficulty: "Experto",
        maxTargets: 25,
        pctRecyclable: 0.70,
        goal: 40,
        fact: "Las pilas y baterías contienen metales pesados altamente tóxicos. Deben reciclarse de forma especializada para que no contaminen el suelo y el agua."
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

    startCampaign: () => void
    startGame: () => void // Wrapper para compatibilidad
    startLevel: () => void
    endGame: () => void
    addScore: (points: number) => void
    recycleItem: (type: string) => void
    hitHazardous: (type: string) => void
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
    gameState: 'menu',
    stats: { ...initialStats },
    unlockedAchievements: [],
    flashColor: null,

    level: 1,
    recycledInLevel: 0,
    totalRecycled: 0,
    xp: 0,

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
        timeLeft: 60
    }),

    startGame: () => {
        get().startCampaign()
    },

    startLevel: () => set(() => ({
        gameState: 'playing',
        timeLeft: 60,
        recycledInLevel: 0
    })),

    endGame: () => set({ gameState: 'gameover' }),

    addScore: (points) => set((state) => ({ score: state.score + points })),

    recycleItem: (type) => set((state) => {
        const key = type as keyof GameStats
        const newStats = { ...state.stats }
        if (key in newStats) {
            newStats[key] = (newStats[key] || 0) + 1
        }

        const newRecycledInLevel = state.recycledInLevel + 1
        const newTotalRecycled = state.totalRecycled + 1
        const newXp = newTotalRecycled * 10
        const currentLevelConfig = LEVELS[state.level - 1]

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
        if (state.level === 3 && newRecycledInLevel >= currentLevelConfig.goal && !newAchievements.includes('mantaro_protector')) {
            newAchievements.push('mantaro_protector')
        }

        // Programar la limpieza del destello visual
        setTimeout(() => {
            useGameStore.setState({ flashColor: null })
        }, 200)

        // Verificar si se completó el nivel
        const levelGoalMet = newRecycledInLevel >= currentLevelConfig.goal
        let nextState: GameState = state.gameState

        if (levelGoalMet) {
            if (state.level >= LEVELS.length) {
                nextState = 'campaign_completed'
            } else {
                nextState = 'level_completed'
            }
        }

        return {
            score: state.score + 100,
            stats: newStats,
            recycledInLevel: newRecycledInLevel,
            totalRecycled: newTotalRecycled,
            xp: newXp,
            unlockedAchievements: newAchievements,
            flashColor: 'green',
            gameState: nextState
        }
    }),

    hitHazardous: () => set((state) => {
        const newStats = { ...state.stats }
        newStats.hazardous = (newStats.hazardous || 0) + 1

        // Programar la limpieza del destello visual
        setTimeout(() => {
            useGameStore.setState({ flashColor: null })
        }, 200)

        return {
            score: Math.max(0, state.score - 500), // Evitar puntaje negativo si se prefiere, o dejar que baje
            stats: newStats,
            flashColor: 'red'
        }
    }),

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
            recycledInLevel: 0
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
        xp: 0
    })
}))
