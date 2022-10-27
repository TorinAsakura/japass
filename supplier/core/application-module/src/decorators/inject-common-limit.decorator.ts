import { Inject }             from '@nestjs/common'

import { COMMON_LIMIT_TOKEN } from '../constants'

export const InjectCommonLimit = () => Inject(COMMON_LIMIT_TOKEN)
