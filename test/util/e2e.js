/**
 * Created by vova on 22/11/2016.
 */

var extend   = require('util')._extend;
var fs       = require('fs');
var run      = require('child_process').fork;
var log;

var defaults = {
    logPath      : "./e2e.log",
    readyNotice  : "listening on port",
    console      : console,
    args         : ["./node_modules/istanbul/lib/cli", "cover", "--dir", "./coverage/e2e-test"],
    timeout      : 10000,
    slow         : 5000
};

module.exports = e2e;

function e2e(options) {
    ctx = extend( extend({}, defaults), options );

    ctx.args.push(options.svc);

    e2e.tearDown = function ctx_teardown(done) {
        tearDown(ctx, done)
    };

    return function ctx_setup(done) {
        setup(ctx, this, done)
    }
}


/**
 @param {object} options
 @param {string} options.sut - system under test - path to the script that
 runs the target server
 @param {string} options.logPath - path to log file
 @param {string} options.readyNotice - output line expected on stdout of
 the started target service that indicates that the service is running
 @param {mocha.Test} test - the test context that implements .timetout(n), .slow(n) ....
 @param {callback} callback
 */
function setup(ctx, test, done) {

    try { fs.unlinkSync( ctx.logPath ) } catch(e) {}

    test.timeout(ctx.timeout);
    test.slow(ctx.slow);

    var log =
        ctx.log =
            fs.createWriteStream(ctx.logPath, { flags: "a"} );

    log.writable = true;

    var child =
        ctx.child =
            run(ctx.args.shift(), ctx.args, { env: process.env, stdio: ['pipe', 'pipe', 'pipe', 'ipc'] } );

    child.stderr.on('data', function(data) {
        data = data + "";
        if (log.writable) log.write("ERR: " + data);
        if (~data.indexOf("Error: listen EADDRINUSE")) {
            done(new Error("    >> Server could not start: Address In Use"));
        }
    });
    child.stdout.on('data', function(data) {
        data = data.toString();
        if (log.writable) log.write(data);

        if (~data.indexOf(ctx.readyNotice)) {
            ctx.console.log("    >> service started: %s", ctx.args.join(' '));
            done();
        }
    });

    child.on('exit', function(e) {
        child.exitted = true;
        ctx.console.log("    >> service termination ended", e || "OK");
        ctx.log.writable = false;
        ctx.log.end(function() {
            child.emit('--over--')
        });
    });
}

/**
 @param {callback}  callback
 */
function tearDown(ctx, done) {
    if (ctx.child.exitted) return done()
    ctx.child.on('--over--', done);
    ctx.child.send('die');
}