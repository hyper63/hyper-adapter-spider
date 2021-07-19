import { ApiFactory, crocks, R } from "./deps.js";
import aws from "./aws.js";
import getLinks from "./lib/spider/get-links.js";
import getContent from "./lib/spider/get-content.js";

import adapter from "./adapter.js";
import PORT_NAME from "./port_name.js";

const { Either } = crocks;
const { Left, Right } = Either;
const { isNil, identity, lensProp, merge, omit, or, over } = R;

export default function spiderAdapter(options) {
  const createFactory = over(
    lensProp("factory"),
    () =>
      (options.awsAccessKeyId && options.awsSecretKey)
        ? new ApiFactory({
          credentials: merge(
            { region: "us-east-1" },
            omit(["links", "content"], options),
          ),
        })
        : new ApiFactory(),
  );

  const loadAws = (env) =>
    over(lensProp("aws"), () => aws.runWith(env.factory), env);

  return Object.freeze({
    id: "spider",
    port: PORT_NAME,
    load: () =>
      Right({})
        .chain(validate(options))
        .map(createFactory)
        .map(loadAws)
        .either(
          (e) => (console.log("ERROR: In load method", e.message), e),
          identity,
        ), // load env
    link: (env) => (_) => adapter(env), // link adapter
  });
}

function validate(options) {
  return () =>
    or(isNil(options.links), isNil(options.content))
      ? Left({ message: "links or content source not set!" })
      : Right({
        getLinks: getLinks(options.links),
        getContent: getContent(options.content),
      });
}
