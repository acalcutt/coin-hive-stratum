const Proxy = require("./build");
const proxy = new Proxy({
  host: "pool.supportxmr.com",
  port: 3333
});
proxy.listen(8892);
