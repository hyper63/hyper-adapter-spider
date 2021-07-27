import "https://deno.land/x/dotenv@v2.0.0/load.ts";

import { sha256 } from "./deps.js";
import { assert, equal } from "./dev_deps.js";
import Adapter from "./adapter.js";
import aws from "./aws_mock.js";

const test = Deno.test;

const crawlerDoc = {
  app: "test",
  name: "spider",
  source: "https://hyper.io",
  depth: 1,
  script: "base64",
  attr: { _category: "1234" },
  target: {
    url: "https://example.com",
    secret: "secret",
    aud: "http://aud.com",
    sub: "user1234",
  },
};

//const getLinks = () => new Promise(resolve => setTimeout(() => resolve(['https://example.com']), 2000));
const getLinks = () =>
  Promise.resolve(["https://example.com", "https://example.com/about"]);
const getContent = () => Promise.resolve({ title: "Hello", content: "World" });
const publishContent = ({ body }) => {
  const id = sha256(body, "utf-8", "hex");
  console.log("body", body);
  return Promise.resolve({ ok: true, id });
};
const publishData = ({ body }) => {
  console.log("data", body);
  return Promise.resolve({ ok: true });
};
const env = { getLinks, getContent, publishContent, publishData, aws };

test("manually submit document", async () => {
  const a = Adapter(env);
  const result = await a.post({
    app: "test",
    name: "spider",
    doc: { title: "Hello", content: "world", link: "https://example.com" },
  });
  console.log(result);
  assert(result.ok);
});

test("start crawl", async () => {
  const a = Adapter(env);
  const result = await a.start("test", "spider");
  assert(result.ok);
});

test("upsert new crawler document", async () => {
  const a = Adapter(env);
  const result = await a.upsert(crawlerDoc);
  assert(result.ok);
});

test("delete crawler document", async () => {
  const a = Adapter(env);
  const result = await a.delete("test", "spider");
  assert(result.ok);
});

test("get crawler document", async () => {
  const a = Adapter(env);
  const result = await a.get("test", "spider");
  equal(result.app, "test");
});
