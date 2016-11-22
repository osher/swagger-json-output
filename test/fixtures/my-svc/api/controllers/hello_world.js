'use strict';

var extend   = require('util')._extend;
var fixture = { 
  statusCode: 200,
  headers:    { 'x-headers' : 'unset'},
  body:       { state: 'unset' }
};

process.on('message', function(fixtureUpdate) {
    if (fixtureUpdate == 'die') return;
    
    updateFixture(fixtureUpdate);
});

module.exports = {
    set_on_both: hello,
    set_only_on_error: hello,
    set_only_as_last_fitting: hello
};

function hello(ctx, next) {
    console.log("request arrived", ctx.request.url );
    ctx.statusCode = fixture.statusCode || 200;

    extend(ctx.headers, fixture.headers || {});
    
    if (fixture.throws) {
        try     { throw fixture.error  } 
        finally { delete fixture.error }
    }
    
    next(fixture.error, fixture.body);
}

function updateFixture(fixtureUpdate) {
    try { 
        extend(fixture, fixtureUpdate);

        if (fixture.error)  {
            fixture.error = extend( new Error( fixture.error.message ), fixture.error )
            if (fixture.circularErr) {
                fixture.error.circular = fixture.error;
            }
        }

        if (fixture.circularBody) 
            fixture.body.circ = fixture.body;

        delete fixture.circularErr;
        delete fixture.circularBody;

        console.log("hello: fixture updated: ", fixture)
        
        process.send('ok');
    }catch(e) {
        console.error("hello: oups...", e)
    }
}
