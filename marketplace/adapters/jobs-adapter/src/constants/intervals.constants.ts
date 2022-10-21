import assert from 'assert'

export const SYNCHRONIZE_PRODUCTS_JOB_INTERVAL = Number(
  process.env.MARKETPLACE_SYNCHRONIZE_PRODUCTS_JOB_INTERVAL_MS
)
export const WRITE_PRODUCTS_JOB_CRON_EXPRESSION =
  process.env.MARKETPLACE_WRITE_PRODUCTS_JOB_CRON_EXPRESSION

assert.ok(
  !Number.isNaN(SYNCHRONIZE_PRODUCTS_JOB_INTERVAL),
  `Missing env variable 'MARKETPLACE_SYNCHRONIZE_PRODUCTS_JOB_INTERVAL_MS'`
)
assert.ok(
  WRITE_PRODUCTS_JOB_CRON_EXPRESSION,
  `Missing env variable 'MARKETPLACE_WRITE_PRODUCTS_JOB_CRON_EXPRESSION'`
)
