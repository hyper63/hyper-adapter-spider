import { crocks, Queue, R } from "./deps.js";

const { Async } = crocks;
const queue = new Queue();
const { assoc, compose, map, merge, prop } = R;

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

  function log(msg) {
    return (
      v,
    ) => (console.log(
      `${new Date().toISOString()} - ${msg}: ${JSON.stringify(v)}`,
    ),
      v);
  }

  function publish(job) {
    return (doc) =>
      Async.of(doc)
        .map(log("GOT Content"))
        .map(transformToHTML)
        .map(log("Transformed Content"))
        .chain(({ html, data }) =>
          publishContent({
            body: html,
            type: "text/html",
            ...job.target,
          })
            .map(log("Published html doc"))
            // need to send same criteria plus doc. name for doPublishData
            .chain(({ id }) =>
              publishData({
                name: `${id}.html.metadata.json`,
                body: {
                  ...data,
                  DocumentId: `${id}.html`,
                  Attributes: {
                    _source_uri: doc.link,
                    ...job.attr,
                  },
                },
                ...job.target,
              })
            )
            .map(log("Published metadata doc"))
        )
        .map(log("Published"));
  }

  function doCrawl(job) {
    return () =>
      Async.of(job)
        .map(log("CRAWL STARTED"))
        .map(prop("source"))
        .chain(doGetLinks)
        .map(log("GOT LINKS"))
        .chain(compose(
          Async.all,
          map((link) =>
            doGetContent(link, job.script)
              .map(assoc("link", link))
              .chain(publish(job)) // <- title, content, link
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
    // doc should contain title, content, link
    post: ({ app, name, doc }) =>
      getObject(app, name)
        .chain((job) => publish(job)(doc))
        .toPromise(),
    get: ({ app, name }) => {
      console.log({ app, name });
      return getObject(app, name).map(
        merge({ id: `${app}-${name}`, app, name }),
      ).toPromise();
    },
    "delete": ({ app, name }) => deleteObject(app, name).toPromise(),
    list: (app) => listObjects(app, "").toPromise(),
  });
}

function transformToHTML({ title, content }) {
  const html = `<!doctype html>
<html>
  <head>
    <title>${title}</title>
  </head>
  <body>
    <header><h1>${title}</h1></header>
    <main>${content}</main>
  </body>
</html>`;
  const data = {
    Title: title,
    ContentType: "HTML",
  };
  return ({ html, data });
}
