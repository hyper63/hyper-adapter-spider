import "https://deno.land/x/dotenv@v2.0.0/load.ts";

import { assert } from './dev_deps.js'
import Adapter from './adapter.js'

const test = Deno.test

const crawlerDoc = {
  app: 'test',
  name: 'spider',
  source: 'https://hyper.io',
  depth: 1,
  script: 'base64',
  target: {
    url: 'https://example.com',
    secret: 'secret',
    aud: 'http://aud.com',
    sub: 'user1234'
  }
}

test('upsert new crawler document', async () => {
  const a = Adapter({aws})
  const result = await a.upsert(crawlerDoc)
  assert(result.ok)
})