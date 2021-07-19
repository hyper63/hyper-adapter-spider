import { crocks, S3 } from "./deps.js";

import { default as createBucket } from "./lib/s3/create-bucket.js";
import { default as listObjects } from "./lib/s3/list-objects.js";
import { default as getObject } from "./lib/s3/get-object.js";
import { default as putObject } from "./lib/s3/put-object.js";
import { default as deleteObject } from "./lib/s3/delete-object.js";
import { default as deleteBucket } from "./lib/s3/delete-bucket.js";

const { Reader } = crocks;
const { of, ask } = Reader;

export default of()
  .chain((_) =>
    ask((factory) => ({
      s3: new S3(factory),
      sqs: new SQS(factory),
    }))
  )
  .map(({ s3 }) => ({
    s3: {
      createBucket: (name) => createBucket(name).runWith(s3),
      deleteBucket: (bucket) => deleteBucket(bucket).runWith(s3),
      listObjects: (bucket, folder) => listObjects(bucket, folder).runWith(s3),
      getObject: (bucket, name) => getObject(bucket, name).runWith(s3),
      putObject: (bucket, name, doc) =>
        putObject(bucket, name, doc).runWith(s3),
      deleteObject: (bucket, name) => deleteObject(bucket, name).runWith(s3),
    },
  }));
