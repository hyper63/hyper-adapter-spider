import { crocks, jwtCreate, R } from "../../deps.js";

const { Async, tryCatch } = crocks;
const { __, assoc } = R;
const asyncFetch = Async.fromPromise(fetch);
export const toJSON = (res) => Async.fromPromise(res.json.bind(res))();

export const createFormData = tryCatch((ctx) => {
  const form = new FormData();
  form.append("file", ctx.file);
  return assoc("form", form, ctx);
});

export const jwt = (payload, secret) =>
  Async.fromPromise(jwtCreate)(
    { alg: "HS256", typ: "JWT" },
    payload,
    secret,
  );

export const createToken = (ctx) =>
  jwt({ sub: ctx.target.sub, aud: ctx.target.aud }, ctx.target.secret)
    .map(assoc("token", __, ctx));

export const send = (ctx) =>
  asyncFetch(ctx.target.url, {
    method: "POST",
    headers: { authorization: `Bearer ${ctx.token}` },
    body: ctx.form,
  });
