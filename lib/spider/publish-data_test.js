// deno-lint-ignore-file

import { assert } from "../../dev_deps.js";

const test = Deno.test;

test("publish metadata.json", async () => {
  const _fetch = window.fetch;

  window.fetch = (url, options) =>
    Promise.resolve({
      json: () => Promise.resolve({ ok: true }),
    });

  const publishData = await import("./publish-data.js");
  const result = await publishData.default({
    body: {
      DocumentId: "1234.html",
      Title: "Hello",
      Attributes: {
        _source_url: "https://example.com",
        _category: "ACCOUNT",
        _source_type: "site",
      },
      ContentType: "HTML",
    },
    url: "https://jsonplaceholder.typicode.com/todos",
    sub: "1234",
    aud: "https://example.com",
    secret: "SECRET",
    name: "1234.html.metadata.json",
  }).toPromise();

  assert(result.ok);

  window.fetch = _fetch;
});
