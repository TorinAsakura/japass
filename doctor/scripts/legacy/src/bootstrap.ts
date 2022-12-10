import { Logger }        from '@atls/logger'

import fetch             from 'node-fetch'
import pLimit            from 'p-limit'
import { writeFileSync } from 'fs'
import { join }          from 'path'

const logger = new Logger('Legacy')

const buildUrl = (path: string) =>
  `https://api.partner.market.yandex.ru${path.replace(
    '{campaignId}',
    process.env.YANDEX_MARKET_CAMPAIGN_ID!
  )}`

const buildHeaders = () => ({
  'content-type': 'application/json',
  Authorization: `OAuth oauth_token=${process.env
    .YANDEX_MARKET_AUTHORIZATION_TOKEN!}, oauth_client_id=${process.env.YANDEX_MARKET_CLIENT_ID!}`,
})

const bootstrap = async () => {
  logger.info('Initializing')

  const limit = pLimit(1)
  const report = { legacy: 0 }

  const fetchPage = async (pageToken?: string) => {
    logger.info(`Fetching page ${pageToken}`)

    const response = await fetch(
      buildUrl(
        `/v2/campaigns/{campaignId}/offer-prices.json?limit=50${
          pageToken ? `&page_token=${pageToken}` : ''
        }`
      ),
      {
        method: 'GET',
        headers: buildHeaders(),
      }
    )

    const body = await response.json()

    if (body.result?.offers) {
      body.result.offers.forEach((offer) => {
        if (!offer.price?.value) {
          report.legacy += 1
        }
      })
    }

    if (body.result?.paging.nextPageToken) {
      limit(() => fetchPage(body.result.paging.nextPageToken))
    } else {
      logger.info(`Done`)
      logger.info('Forming report...')
      const reportPath = join(__dirname, 'report.json')
      writeFileSync(reportPath, Buffer.from(JSON.stringify(report)))
      logger.info(`Saved report to ${reportPath}`)
    }
  }

  fetchPage()
}

bootstrap()
