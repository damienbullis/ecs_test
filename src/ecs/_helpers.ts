export const WORLD_ENUM = {
    EMPTY: 0,
    OBSTACLE: 1,
    ROVER: 2,
    TARGET: 3,
} as const

export type WorldType = (typeof WORLD_ENUM)[keyof typeof WORLD_ENUM]

export const INITIAL_WORLD: WorldType[][] = [
    [0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
]

export function getHistoryColor(color: string, index: number) {
    // Validate input color format
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
        throw new Error('Invalid hex color format')
    }

    const opacity = 100 - (index + 1) * 20

    return `${color}${opacity}`
}

export function generateRandomColor() {
    const letters = '0123456789ABCDEF'
    let color = '#'

    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }

    return color
}

// export function getHistoryColor(color: string, index: number): string {
//     // Validate input color format
//     if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
//         throw new Error('Invalid hex color format')
//     }

//     // Remove the '#' character
//     color = color.slice(1)

//     // Convert hex to RGB
//     let r = parseInt(color.slice(0, 2), 16)
//     let g = parseInt(color.slice(2, 4), 16)
//     let b = parseInt(color.slice(4, 6), 16)

//     // Calculate the lighten factor (10% for each index)
//     const lightenFactor = 1 + (index + 1) * 0.33

//     // Lighten the color components
//     r = Math.min(255, Math.round(r * lightenFactor))
//     g = Math.min(255, Math.round(g * lightenFactor))
//     b = Math.min(255, Math.round(b * lightenFactor))

//     // Convert RGB back to hex and pad with zeros if necessary
//     const resultColor = `#${r.toString(16).padStart(2, '0')}${g
//         .toString(16)
//         .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`

//     return resultColor
// }
