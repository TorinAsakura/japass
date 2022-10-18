import { Inject }           from '@nestjs/common'

import { ACTIVE_JOB_TOKEN } from '../constants'

export const InjectActiveJob = () => Inject(ACTIVE_JOB_TOKEN)
