export interface IKomusAdapterModuleOptions {
  url: string
  token: string
}

export const KomusAdapterModuleOptions: IKomusAdapterModuleOptions = {
  url: 'https://komus-opt.ru',
  token: process.env.KOMUS_AUTHORIZATION_TOKEN || '',
}
