import {
  ask,
  compose,
  equals,
  map,
  pluck,
  prop,
  reject,
  replace,
} from "../utils.js";

const getKeys = (folder) =>
  compose(
    map(replace(".json", "")),
    reject(equals(`${folder}/`)),
    pluck("Key"),
    prop("Contents"),
  );

export default (bucket, folder) =>
  ask((s3) =>
    s3.listObjects({
      Bucket: `hyper-crawler-${bucket}`,
      Prefix: folder,
    })
      .then(getKeys(folder))
  );
