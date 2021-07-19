import { crocks } from "./deps.js";

const { Async } = crocks;

export default function ({ aws: { s3 } }) {
  const createBucket = Async.fromPromise(s3.createBucket);
  const putObject = Async.fromPromise(s3.putObject);
  const getObject = Async.fromPromise(s3.getObject);
  const deleteObject = Async.fromPromise(s3.deleteObject);
  const listObjects = Async.fromPromise(s3.listObjects);

  return Object.freeze({
    upsert: ({ app, name, ...crawlerDoc }) =>
      createBucket(app)
        .chain(() => putObject(app, name, crawlerDoc))
        .toPromise(),
    //start: ({ app, name }) => Promise.resolve({ ok: true }),
    get: ({ app, name }) => getObject(app, name).toPromise(),
    "delete": ({ app, name }) => deleteObject(app, name).toPromise(),
    list: (app) => listObjects(app, "").toPromise(),
  });
}
