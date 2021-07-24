// deno-lint-ignore-file

let doc = {
  app: "test",
  name: "spider",
  source: "https://hyper.io",
  depth: 1,
  script: "base64",
  attr: { _category: '1234' },
  target: {
    url: "https://example.com",
    secret: "secret",
    aud: "http://aud.com",
    sub: "user1234",
  },
};

export default {
  s3: {
    createBucket,
    getObject,
    putObject,
    deleteObject,
    listObjects,
  },
};

function createBucket(name) {
  return Promise.resolve(`/hyper-crawler-${name}`);
}

function putObject(svc, name, value) {
  doc = value;
  return Promise.resolve({ ok: true });
}

function getObject(svc, name) {
  return Promise.resolve(doc);
}

function deleteObject(svc, name) {
  return Promise.resolve({ ok: true });
}

function listObjects(name) {
  return Promise.resolve([]);
}
