import { create } from 'zustand'

export type GameState = 'menu' | 'playing' | 'gameover'

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
    { id: 'recycle_5', name: 'Protector Novato', description: 'Reciclaste 5 residuos', icon: '🧹' },
    { id: 'recycle_10', name: 'Agente Guardián', description: 'Reciclaste 10 residuos', icon: '♻️' },
    { id: 'recycle_20', name: 'Héroe del Mantaro', description: 'Reciclaste 20 residuos', icon: '🌎' }
]

export const ENVIRONMENTAL_FACTS = [
    "Una botella plástica puede tardar cientos de años en degradarse.",
    "Reciclar una lata ahorra energía y recursos naturales.",
    "Separar residuos correctamente reduce la contaminación.",
    "El reciclaje ayuda a proteger los ríos y áreas verdes."
]

interface GameStore {
    score: number // Representa el "Impacto Ambiental"
    timeLeft: number
    gameState: GameState
    stats: GameStats
    unlockedAchievements: string[]
    lastFact: string
    flashColor: 'green' | 'red' | null
    startGame: () => void
    endGame: () => void
    addScore: (points: number) => void
    recycleItem: (type: string) => void
    hitHazardous: (type: string) => void
    tickTimer: (delta: number) => void
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

export const useGameStore = create<GameStore>((set) => ({
    score: 0,
    timeLeft: 60,
    gameState: 'menu',
    stats: { ...initialStats },
    unlockedAchievements: [],
    lastFact: '',
    flashColor: null,

    startGame: () => set({
        gameState: 'playing',
        score: 0,
        timeLeft: 60,
        stats: { ...initialStats },
        unlockedAchievements: [],
        lastFact: ENVIRONMENTAL_FACTS[Math.floor(Math.random() * ENVIRONMENTAL_FACTS.length)],
        flashColor: null
    }),

    endGame: () => set({ gameState: 'gameover' }),

    addScore: (points) => set((state) => ({ score: state.score + points })),

    recycleItem: (type) => set((state) => {
        const key = type as keyof GameStats
        const newStats = { ...state.stats }
        if (key in newStats) {
            newStats[key] = (newStats[key] || 0) + 1
        }

        const totalRecycled = newStats.plastic_bottle + newStats.aluminum_can + newStats.paper + newStats.cardboard + newStats.container
        const newAchievements = [...state.unlockedAchievements]

        if (totalRecycled >= 1 && !newAchievements.includes('first_recycle')) {
            newAchievements.push('first_recycle')
        }
        if (totalRecycled >= 5 && !newAchievements.includes('recycle_5')) {
            newAchievements.push('recycle_5')
        }
        if (totalRecycled >= 10 && !newAchievements.includes('recycle_10')) {
            newAchievements.push('recycle_10')
        }
        if (totalRecycled >= 20 && !newAchievements.includes('recycle_20')) {
            newAchievements.push('recycle_20')
        }

        // Programar la limpieza del destello visual
        setTimeout(() => {
            useGameStore.setState({ flashColor: null })
        }, 200)

        return {
            score: state.score + 100,
            stats: newStats,
            unlockedAchievements: newAchievements,
            flashColor: 'green'
        }
    }),

    hitHazardous: (_type) => set((state) => {
        const newStats = { ...state.stats }
        newStats.hazardous = (newStats.hazardous || 0) + 1

        // Programar la limpieza del destello visual
        setTimeout(() => {
            useGameStore.setState({ flashColor: null })
        }, 200)

        return {
            score: state.score - 500,
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

    reset: () => set({
        gameState: 'menu',
        score: 0,
        timeLeft: 60,
        stats: { ...initialStats },
        unlockedAchievements: [],
        lastFact: ''
    })
}))
