// deno-lint-ignore-file
import { assert } from "../../dev_deps.js";

const test = Deno.test;

test("publish content", async () => {
  const _fetch = fetch;

  fetch = (url, options) =>
    Promise.resolve({
      json: () => Promise.resolve({ ok: true }),
    });

  const publishContent = await import("./publish-content.js");

  const request = publishContent.default({
    url: "https://jsonplaceholder.typicode.com/todos",
    body: `<h1>Hello World</h1>`,
    sub: "1234",
    aud: "https://example.com",
    secret: "secret",
  });
  const result = await request.toPromise();

  assert(result.ok);

  window.fetch = _fetch;
});
