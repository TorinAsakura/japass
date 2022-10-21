import { Inject }                            from '@nestjs/common'

import { REWRITE_ENFORCER_REPOSITORY_TOKEN } from '../constants'

export const InjectRewriteEnforcerRepository = () => Inject(REWRITE_ENFORCER_REPOSITORY_TOKEN)
