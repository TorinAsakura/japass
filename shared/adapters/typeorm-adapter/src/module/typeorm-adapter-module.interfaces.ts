export interface SupplierTypeOrmDbOptions {
  port?: number
  host?: string
  database?: string
  username?: string
  password?: string
}

export interface SupplierTypeOrmOptions {
  db?: SupplierTypeOrmDbOptions
}
