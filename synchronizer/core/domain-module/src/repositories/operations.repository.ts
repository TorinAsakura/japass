import { Operation } from '../aggregates'

export const OPERATIONS_REPOSITORY_TOKEN = 'OPERATIONS_REPOSITORY_TOKEN'

export abstract class OperationsRepository {
  create(): Operation {
    return new Operation()
  }

  abstract save(aggregate: Operation): Promise<void>

  abstract findById(id: string): Promise<Operation | undefined>

  abstract findLastCompleted(): Promise<Operation | undefined>
}
