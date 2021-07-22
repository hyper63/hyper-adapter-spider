import { crocks, R, sha256 } from "../../deps.js";
import { createFormData, createToken, send, toJSON } from "./helpers.js";

const { pipeK, Result, resultToAsync, tryCatch } = crocks;
const { assoc } = R;

const createFile = tryCatch(
  (ctx) =>
    assoc(
      "file",
      new File([ctx.body], `${sha256(ctx.body, "utf-8", "hex")}.html`),
      ctx,
    ),
);

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
