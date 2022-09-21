import { RewriteEnforcer } from '../aggregates'

export const REWRITE_ENFORCER_REPOSITORY_TOKEN = 'REWRITE_ENFORCER_REPOSITORY_TOKEN'

export abstract class RewriteEnforcerRepository {
  create(): RewriteEnforcer {
    return new RewriteEnforcer()
  }

  abstract save(aggregate: RewriteEnforcer): Promise<void>

  abstract findOne(): Promise<RewriteEnforcer | undefined>
}
