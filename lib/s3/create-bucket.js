import { ask, assoc, prop } from "../utils.js";

export default (name) =>
  ask((s3) =>
    s3.createBucket(
      assoc("Bucket", `hyper-crawler-${name}`, {}),
    ).then(prop("Location"))
  );
