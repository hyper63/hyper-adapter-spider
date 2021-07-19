import { crocks, Queue, R } from "./deps.js";

const { Async } = crocks;
const queue = new Queue();
const { compose, map } = R;

export default function (
  { getLinks, getContent, publishContent, aws: { s3 } },
) {
  const createBucket = Async.fromPromise(s3.createBucket);
  const putObject = Async.fromPromise(s3.putObject);
  const getObject = Async.fromPromise(s3.getObject);
  const deleteObject = Async.fromPromise(s3.deleteObject);
  const listObjects = Async.fromPromise(s3.listObjects);
  const doGetLinks = Async.fromPromise(getLinks);
  const doGetContent = Async.fromPromise(getContent);
  const doPublishContent = Async.fromPromise(publishContent);

  function doCrawl(doc) {
    return () =>
      doGetLinks(doc.source)
        .map((links) => (console.log("GOT LINKS:", links), links))
        .chain(compose(
          Async.all,
          map((link) =>
            doGetContent(link, doc.script)
              .map((doc) => (console.log("GOT CONTENT:", doc), doc))
              .map(({ title, content }) =>
                `<!doctype html>
<html>
  <head>
    <title>${title}</title>
  </head>
  <body>
    <header><h1>${title}</h1></header>
    <main>${content}</main>
  </body>
</html>
`
              )
              .map((doc) => (console.log("Transformed CONTENT:", doc), doc))
              .chain(doPublishContent)
              .map((r) => (console.log("Published:", r.ok), r))
          ),
        ))
        .fork(
          (e) => console.log(e.message),
          (r) => console.log(JSON.stringify(r)),
        );
    //.chain()
  }

  return Object.freeze({
    upsert: ({ app, name, ...crawlerDoc }) =>
      createBucket(app)
        .chain(() => putObject(app, name, crawlerDoc))
        .toPromise(),
    start: ({ app, name }) =>
      getObject(app, name)
        .map((doc) => queue.push(doCrawl(doc)))
        .map(() => ({ ok: true }))
        .toPromise(),
    //post: ({ app, name, doc }) => {
    // create a manual content document
    //},
    get: ({ app, name }) => getObject(app, name).toPromise(),
    "delete": ({ app, name }) => deleteObject(app, name).toPromise(),
    list: (app) => listObjects(app, "").toPromise(),
  });
}
