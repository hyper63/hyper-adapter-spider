require('puppeteer-core')
const chromium = require('chrome-aws-lambda')
const { addExtra } = require('puppeteer-extra')
const puppeteer = addExtra(chromium.puppeteer)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const AnonymizeUA = require('puppeteer-extra-plugin-anonymize-ua')
const { compose, filter, uniq } = require('ramda')

puppeteer.use(StealthPlugin())
puppeteer.use(AnonymizeUA())

exports.handler = async function http(req) {
  try {
    const { url, script } = JSON.parse(req.body)
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    })
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(0)

    await page.goto(url)

    let result = await page.evaluate(new Function(script))

    page.close()
    browser.close()

    return {
      headers: {
        'Content-Type': 'application/json'
      },
      statusCode: 200,
      body: JSON.stringify({ url, ...result })
    }
  } catch (e) {
    console.log('error: ', e)
    return {
      headers: {
        'Content-Type': 'application/json'
      },
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    }
  }
}
