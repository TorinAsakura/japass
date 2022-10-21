import assert from 'assert'

export const MIN_PRICE = Number(process.env.MIN_PRICE)

assert.ok(!Number.isNaN(MIN_PRICE), `Missing env variable 'MIN_PRICE'`)
