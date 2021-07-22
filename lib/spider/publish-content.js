import { crocks, jwtCreate, R, sha256 } from "../../deps.js";

const { Async, pipeK, Result, resultToAsync, tryCatch } = crocks;
const { __, assoc } = R;
const asyncFetch = Async.fromPromise(fetch);
const toJSON = (res) => Async.fromPromise(res.json.bind(res))();

const createFile = tryCatch(
  (ctx) =>
    assoc(
      "file",
      new File([ctx.body], `${sha256(ctx.body, "utf-8", "hex")}.html`),
      ctx,
    ),
);

const createFormData = tryCatch((ctx) => {
  const form = new FormData();
  form.append("file", ctx.file);
  return assoc("form", form, ctx);
});

const jwt = (payload, secret) =>
  Async.fromPromise(jwtCreate)(
    { alg: "HS256", typ: "JWT" },
    payload,
    secret,
  );

const createToken = (ctx) =>
  jwt({ sub: ctx.target.sub, aud: ctx.target.aud }, ctx.target.secret)
    .map(assoc("token", __, ctx));

const send = (ctx) =>
  asyncFetch(ctx.target.url, {
    method: "POST",
    headers: { authorization: `Bearer ${ctx.token}` },
    body: ctx.form,
  });

/**
 * @typedef {Object} Context
 * @property {string} url - target url
 * @property {string} body - html file content
 * @property {string} sub - subject
 * @property {string} aud - audience
 * @property {string} secret - secret for jwt token signing
 *
 * @param {Context} context
 */
export default function (
  { url, body, sub, aud, secret },
) {
  const doResult = pipeK(
    Result.of,
    createFile,
    createFormData,
  );

  return pipeK(
    (ctx) => resultToAsync(doResult(ctx)),
    createToken,
    send,
    toJSON,
  )({
    body,
    target: { url, sub, aud, secret },
  });
}
