"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid = require("uuid");
var Donation = /** @class */ (function () {
    function Donation(options) {
        var _this = this;
        this.id = uuid.v4();
        this.address = null;
        this.host = null;
        this.port = null;
        this.user = null;
        this.pass = null;
        this.percentage = null;
        this.connection = null;
        this.online = false;
        this.jobs = [];
        this.taken = [];
        this.heartbeat = null;
        this.ready = null;
        this.resolver = null;
        this.resolved = false;
        this.address = options.address;
        this.host = options.host;
        this.port = options.port;
        this.pass = options.pass;
        this.percentage = options.percentage;
        this.connection = options.connection;
        this.ready = new Promise(function (resolve) {
            _this.resolved = false;
            _this.resolver = resolve;
        });
    }
    Donation.prototype.connect = function () {
        var _this = this;
        var login = this.address;
        if (this.user) {
            login += "." + this.user;
        }
        this.connection.send(this.id, "login", {
            login: login,
            pass: this.pass
        });
        this.connection.on(this.id + ":job", this.handleJob.bind(this));
        this.heartbeat = setInterval(function () { return _this.connection.send(_this.id, "keepalived"); }, 30000);
        this.online = true;
        setTimeout(function () {
            if (!_this.resolved) {
                _this.resolved = true;
                _this.resolver();
            }
        }, 5000);
    };
    Donation.prototype.kill = function () {
        this.connection.clear(this.id);
        this.connection.removeAllListeners(this.id + ":job");
        this.jobs = [];
        this.taken = [];
        if (this.heartbeat) {
            clearInterval(this.heartbeat);
            this.heartbeat = null;
        }
        this.online = false;
        this.resolved = false;
    };
    Donation.prototype.submit = function (job) {
        this.connection.send(this.id, "submit", job);
    };
    Donation.prototype.handleJob = function (job) {
        this.jobs.push(job);
        if (!this.resolved) {
            this.resolver();
            this.resolved = true;
        }
    };
    Donation.prototype.getJob = function () {
        var job = this.jobs.pop();
        this.taken.push(job);
        return job;
    };
    Donation.prototype.shouldDonateJob = function () {
        var chances = Math.random();
        var shouldDonateJob = this.jobs.length > 0 && chances < this.percentage;
        return shouldDonateJob;
    };
    Donation.prototype.hasJob = function (job) {
        return this.taken.some(function (j) { return j.job_id === job.job_id; });
    };
    return Donation;
}());
exports.default = Donation;
