const Proxy = require("coin-hive-stratum");
const proxy = new Proxy({
  host: "pool.supportxmr.com",
  port: 3333
});
proxy.listen(8892);
