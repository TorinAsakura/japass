import pLimit from 'p-limit'

export const commonLimit = pLimit(2)
