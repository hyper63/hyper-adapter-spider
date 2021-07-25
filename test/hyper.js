import { appOpine, core } from "../dev_deps.js";
import myAdapter from "../mod.js";
import PORT_NAME from "../port_name.js";

const hyperConfig = {
  app: appOpine,
  adapters: [
    { port: PORT_NAME, plugins: [myAdapter({
      links: 'https://sntioqhye8.execute-api.us-west-2.amazonaws.com',
      content: 'https://sntioqhye8.execute-api.us-west-2.amazonaws.com'
    })] },
  ],
};

core(hyperConfig);
