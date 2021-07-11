// deno-lint-ignore-file no-unused-vars

export default function (_env) {

  return Object.freeze({
    upsert(o) => Promise.resolve({ ok: true }),
    start: ({ app, name }) => Promise.resolve({ ok: true }),
    get: ({ app, name }) => Promise.resolve({}),
    'delete': ({ app, name }) => Promise.resolve(),
    list: () => Promise.resolve([])
  });
}
