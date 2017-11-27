module.exports = {
  host: "pool.supportxmr.com",
  port: 3333,
  pass: "x",
  tls: false,
  address: null,
  user: null,
  diff: null,
  log: true,
  logFile: null,
  statsFile: null,
  dynamicPool: false,
  path: null,
  maxMinersPerConnection: 100,
  donations: [
    {
      address: "46WNbmwXpYxiBpkbHjAgjC65cyzAxtaaBQjcGpAZquhBKw2r8NtPQniEgMJcwFMCZzSBrEJtmPsTR54MoGBDbjTi2W1XmgM",
      host: "pool.supportxmr.com",
      port: 3333,
      pass: "donations",
      percentage: 0.01 // 1%
    }
  ]
};
