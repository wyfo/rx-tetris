export const applyToMatrix = (matrix, pts, value) => pts.forEach(([i, j]) => matrix[i][j] = value)

export const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
