import { IYandexMarketAdapterConfig } from './yandex-market-adapter-config.interfaces'

export const YandexMarketAdapterConfig: IYandexMarketAdapterConfig = {
  url: 'https://api.partner.market.yandex.ru',
  token: process.env.YANDEX_MARKET_AUTHORIZATION_TOKEN || '',
  clientId: process.env.YANDEX_MARKET_CLIENT_ID || '',
  campaignId: process.env.YANDEX_MARKET_CAMPAIGN_ID || '',
}
