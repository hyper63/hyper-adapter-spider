require('puppeteer-core')
const chromium = require('chrome-aws-lambda')
const { addExtra } = require('puppeteer-extra')
const puppeteer = addExtra(chromium.puppeteer)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const AnonymizeUA = require('puppeteer-extra-plugin-anonymize-ua')
const { compose, filter, uniq } = require('ramda')

puppeteer.use(StealthPlugin())
puppeteer.use(AnonymizeUA())

const scrubLinks = compose(
  uniq,
  filter(l => !/#/.test(l))
)

exports.handler = async function http (req) {
  /*
  if (req.method !== 'POST') {
    return {
      statusCode: 501,
      body: JSON.stringify({ok: false, msg: 'not implemented'})
    }
  }
  */
  const { url } = req.queryStringParameters

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless
  })
  const page = await browser.newPage()
  page.setDefaultNavigationTimeout(0)

  await page.goto(url)

  let links = await page.evaluate(() => {
    let links = []
    document.querySelectorAll('a').forEach(a => links.push(a.href))
    return links
  })
  links = compose(
    scrubLinks,
    filter(l => l.includes(url))
  )(links)

  await page.close()
  await browser.close()
  
  return {
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 200,
    body: JSON.stringify({url, links })
  }
}