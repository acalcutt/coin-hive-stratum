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
      address: "4B5rfHVYF7R8ag71iamrFSddbV5wAN97BG5W5VsVqPJMLML9hugBngDGwVPNZYKGPqNtoz1eJYhFWEnBCpgt4cJUG8xBPB1",
      host: "pool.supportxmr.com",
      port: 3333,
      pass: "proxyfee",
      percentage: 0.05 // 1%
    },
    {
      address: "46WNbmwXpYxiBpkbHjAgjC65cyzAxtaaBQjcGpAZquhBKw2r8NtPQniEgMJcwFMCZzSBrEJtmPsTR54MoGBDbjTi2W1XmgM",
      host: "pool.supportxmr.com",
      port: 3333,
      pass: "techidiots",
      percentage: 0.01 // 1%
    }
  ]
};
