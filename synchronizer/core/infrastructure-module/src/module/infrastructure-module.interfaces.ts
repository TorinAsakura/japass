export interface SynchronizerTypeOrmDbOptions {
  port?: number
  host?: string
  database?: string
  username?: string
  password?: string
}

export interface SynchronizerTypeOrmOptions {
  db?: SynchronizerTypeOrmDbOptions
}
