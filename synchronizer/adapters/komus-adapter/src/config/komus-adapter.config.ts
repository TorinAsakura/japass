import { IKomusAdapterConfig } from './komus-adapter-config.interfaces'

export const KomusAdapterConfig: IKomusAdapterConfig = {
  url: 'https://komus-opt.ru',
  token: process.env.KOMUS_AUTHORIZATION_TOKEN || '',
}
