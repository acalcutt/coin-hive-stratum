"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var url = require("url");
var http = require("http");
var https = require("https");
var defaults = require("../config/defaults");
var Connection_1 = require("./Connection");
var Miner_1 = require("./Miner");
var Donation_1 = require("./Donation");
var Proxy = /** @class */ (function () {
    function Proxy(constructorOptions) {
        if (constructorOptions === void 0) { constructorOptions = defaults; }
        var _this = this;
        this.host = null;
        this.port = null;
        this.pass = null;
        this.ssl = null;
        this.address = null;
        this.user = null;
        this.diff = null;
        this.dynamicPool = false;
        this.maxMinersPerConnection = 100;
        this.donations = [];
        this.connections = {};
        this.wss = null;
        this.key = null;
        this.cert = null;
        this.path = null;
        this.server = null;
        this.purgeInterval = null;
        var options = Object.assign({}, defaults, constructorOptions);
        this.host = options.host;
        this.port = options.port;
        this.pass = options.pass;
        this.ssl = options.ssl;
        this.address = options.address;
        this.user = options.user;
        this.diff = options.diff;
        this.dynamicPool = options.dynamicPool;
        this.maxMinersPerConnection = options.maxMinersPerConnection;
        this.donations = options.donations;
        this.key = options.key;
        this.cert = options.cert;
        this.path = options.path;
        this.server = options.server;
        this.purgeInterval = setInterval(function () { return _this.purge(); }, 30 * 1000);
    }
    Proxy.prototype.listen = function (port) {
        var _this = this;
        // create server
        var isHTTPS = !!(this.key && this.cert);
        if (!this.server) {
            var stats = function (req, res) {
                var url = require("url").parse(req.url);
                if (url.pathname === "/stats") {
                    var body = JSON.stringify(_this.getStats(), null, 2);
                    res.writeHead(200, {
                        "Content-Length": Buffer.byteLength(body),
                        "Content-Type": "application/json"
                    });
                    res.end(body);
                }
            };
            if (isHTTPS) {
                var certificates = {
                    key: this.key,
                    cert: this.cert
                };
                this.server = https.createServer(certificates, stats);
            }
            else {
                this.server = http.createServer(stats);
            }
        }
        var wssOptions = {
            server: this.server
        };
        if (this.path) {
            wssOptions.path = this.path;
        }
        this.wss = new WebSocket.Server(wssOptions);
        this.wss.on("connection", function (ws, req) {
            var params = url.parse(req.url, true).query;
            var host = _this.host;
            var port = _this.port;
            var pass = _this.pass;
            if (params.pool && _this.dynamicPool) {
                var split = params.pool.split(":");
                host = split[0] || _this.host;
                port = Number(split[1]) || _this.port;
                pass = split[2] || _this.pass;
            }
            var connection = _this.getConnection(host, port);
            var donations = _this.donations.map(function (donation) {
                return new Donation_1.default({
                    address: donation.address,
                    host: donation.host,
                    port: donation.port,
                    pass: donation.pass,
                    percentage: donation.percentage,
                    connection: _this.getConnection(donation.host, donation.port, true)
                });
            });
            var miner = new Miner_1.default({
                connection: connection,
                ws: ws,
                address: _this.address,
                user: _this.user,
                diff: _this.diff,
                pass: pass,
                donations: donations
            });
            miner.connect();
        });
        this.server.listen(port);
        console.log("listening on port " + port + (isHTTPS ? ", using a secure connection" : ""));
        if (wssOptions.path) {
            console.log("path: " + wssOptions.path);
        }
        if (!this.dynamicPool) {
            console.log("host: " + this.host);
            console.log("port: " + this.port);
            console.log("pass: " + this.pass);
        }
    };
    Proxy.prototype.getConnection = function (host, port, donation) {
        var _this = this;
        if (donation === void 0) { donation = false; }
        var connectionId = host + ":" + port;
        if (!this.connections[connectionId]) {
            this.connections[connectionId] = [];
        }
        var connections = this.connections[connectionId];
        var availableConnections = connections.filter(function (connection) { return _this.isAvailable(connection); });
        if (availableConnections.length === 0) {
            var connection = new Connection_1.default({ host: host, port: port, ssl: this.ssl, donation: donation });
            connection.connect();
            connection.on("close", function () {
                console.log("connection closed (" + connectionId + ")");
            });
            connection.on("error", function (error) {
                console.log("connection error (" + connectionId + "):", error.message);
            });
            connections.push(connection);
            return connection;
        }
        var _loop_1 = function () {
            var unusedConnection = availableConnections.pop();
            this_1.connections[connectionId] = this_1.connections[connectionId].filter(function (connection) { return connection.id !== unusedConnection.id; });
            unusedConnection.kill();
        };
        var this_1 = this;
        while (availableConnections.length > 1) {
            _loop_1();
        }
        return availableConnections.pop();
    };
    Proxy.prototype.isAvailable = function (connection) {
        return (connection.miners.length < this.maxMinersPerConnection &&
            connection.donations.length < this.maxMinersPerConnection);
    };
    Proxy.prototype.getStats = function () {
        var _this = this;
        return Object.keys(this.connections).reduce(function (stats, key) { return ({
            miners: stats.miners + _this.connections[key].reduce(function (miners, connection) { return miners + connection.miners.length; }, 0),
            connections: stats.connections + _this.connections[key].filter(function (connection) { return !connection.donation; }).length
        }); }, {
            miners: 0,
            connections: 0
        });
    };
    Proxy.prototype.kill = function () {
        var _this = this;
        if (this.purgeInterval) {
            clearInterval(this.purgeInterval);
        }
        Object.keys(this.connections).forEach(function (connectionId) {
            var connections = _this.connections[connectionId];
            connections.forEach(function (connection) {
                connection.kill();
                connection.miners.forEach(function (miner) { return miner.kill(); });
            });
        });
        this.wss.close();
    };
    Proxy.prototype.purge = function () {
        var _this = this;
        Object.keys(this.connections).forEach(function (connectionId) {
            var connections = _this.connections[connectionId];
            var availableConnection = connections.filter(function (connection) { return _this.isAvailable(connection); });
            var unusedConnections = availableConnection.slice(1);
            unusedConnections.forEach(function (unusedConnection) {
                console.log("purge (" + connectionId + "):", unusedConnection.id);
                _this.connections[connectionId] = _this.connections[connectionId].filter(function (connection) { return connection.id !== unusedConnection.id; });
                unusedConnection.kill();
            });
        });
    };
    return Proxy;
}());
exports.default = Proxy;
