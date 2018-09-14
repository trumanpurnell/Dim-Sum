import nd from '../ndarray'

const A = nd.array([
    [4, 3, 1, 7, 6, 2, 8],
    [2, 3, 1, 9, 5, 8, 0],
    [4, 6, 9, 5, 5, 1, 2],
    [4, 9, 1, 1, 2, 1, 7],
    [3, 4, 6, 8, 7, 8, 0],
    [3, 8, 2, 2, 2, 3, 1],
    [9, 8, 2, 8, 9, 3, 6],
    [7, 7, 1, 0, 1, 9, 5],
    [9, 3, 7, 9, 2, 0, 0],
    [4, 9, 7, 3, 7, 2, 6]
], 'float64')

for (const [a, b, c, d, e, f, g] of A)
    console.log(b, a, e)



    
