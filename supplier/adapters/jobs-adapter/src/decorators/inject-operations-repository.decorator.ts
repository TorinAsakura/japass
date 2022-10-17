import { Inject }                      from '@nestjs/common'

import { OPERATIONS_REPOSITORY_TOKEN } from '../constants'

export const InjectOperationsRepository = () => Inject(OPERATIONS_REPOSITORY_TOKEN)
