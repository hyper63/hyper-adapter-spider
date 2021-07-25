import { appOpine, core } from "../dev_deps.js";
import myAdapter from "../mod.js";
import PORT_NAME from "../port_name.js";

const spiderUrl = Deno.env.get('SPIDER_URL')

const hyperConfig = {
  app: appOpine,
  adapters: [
    {
      port: PORT_NAME, plugins: [myAdapter({
        links: spiderUrl,
        content: spiderUrl
      })]
    },
  ],
};

await core(hyperConfig);
