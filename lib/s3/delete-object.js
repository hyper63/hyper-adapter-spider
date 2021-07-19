import { ask } from "../utils.js";

export default (bucket, name) =>
  ask((s3) =>
    s3.deleteObject({
      Bucket: `hyper-crawler-${bucket}`,
      Key: `${name}.json`,
    }).then(() => ({ ok: true }))
  );
