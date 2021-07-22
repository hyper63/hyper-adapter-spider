import { crocks, Queue, R } from "./deps.js";

const { Async } = crocks;
const queue = new Queue();
const { compose, map, prop } = R;

export default function (
  { getLinks, getContent, publishContent, publishData, aws: { s3 } },
) {
  const createBucket = Async.fromPromise(s3.createBucket);
  const putObject = Async.fromPromise(s3.putObject);
  const getObject = Async.fromPromise(s3.getObject);
  const deleteObject = Async.fromPromise(s3.deleteObject);
  const listObjects = Async.fromPromise(s3.listObjects);
  const doGetLinks = Async.fromPromise(getLinks);
  const doGetContent = Async.fromPromise(getContent);
  const doPublishContent = Async.fromPromise(publishContent);
  const doPublishData = Async.fromPromise(publishData);

  function log(msg) {
    return (
      v,
    ) => (console.log(
      `${new Date().toISOString()} - ${msg}: ${JSON.stringify(v)}`,
    ),
      v);
  }

  function doCrawl(doc) {
    return () =>
      Async.of(doc)
        .map(log("CRAWL STARTED"))
        .map(prop("source"))
        .chain(doGetLinks)
        .map(log("GOT LINKS"))
        .chain(compose(
          Async.all,
          map((link) =>
            doGetContent(link, doc.script)
              .map(log("Got Content"))
              .map(transformToHTML)
              .map(log("Transformed Content"))
              .chain((html) =>
                doPublishContent({
                  body: html,
                  type: "text/html",
                  ...doc.target,
                })
              )
              // need to send same criteria plus doc. name for doPublishData
              .chain(() => doPublishData({ ...doc.attr }))
              .map(log("Published"))
          ),
        ))
        .fork(
          log("CRAWL ERROR"),
          log("CRAWL COMPLETED"),
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
    post: ({ app, name, doc }) =>
      getObject(app, name)
        .chain((job) => doPublishContent({ body: doc, ...job.target }))
        // need to send same criteria plus doc. name for doPublishData
        .chain(({id}) => doPublishData({ 
          name: `${id}.metadata.json`,
          body: {
            DocumentId: id,
            Title: doc.title,
            Attributes: {
              ...job.attr
            },
            ContentType: 'HTML'
          },
        })),
    get: ({ app, name }) => getObject(app, name).toPromise(),
    "delete": ({ app, name }) => deleteObject(app, name).toPromise(),
    list: (app) => listObjects(app, "").toPromise(),
  });
}

function transformToHTML({ title, content }) {
  return `<!doctype html>
<html>
  <head>
    <title>${title}</title>
  </head>
  <body>
    <header><h1>${title}</h1></header>
    <main>${content}</main>
  </body>
</html>`;
}
