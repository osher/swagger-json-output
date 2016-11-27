process.env.TEST_MODE = true;
var sut     = require('../');
var request = require('mocha-ui-exports-request');
var fittingDef;
var ctx;

module.exports = {
  "swagger-json-output" : {
    "should be a function that names 2 arugment - fittingDef, bagpipes" : function() {
        Should(sut).be.a.Function().have.property("length", 2)
    },
    "when used with .beautifyJson true" : "checked in e2e tests",
    "when used with .beautifyJson false" : {
        beforeAll: function(done){
            ctxAndFittingDefGenerator(true);
            ctx.request.headers = {
                accept:'text/x-inspect'
            };
            ctx.output = 'Hello world.'
            var openapi_result = sut(fittingDef, null);
            openapi_result(ctx, function(err, res){
                done();
            });
        },
        "should not failed" : function() {
            Should(ctx).be.an.Object();
        },
        "should have .statusCode equal 200" : function() {
            Should(ctx.statusCode).equal(200);
        },
        "should correct 'content-type' to 'text/x-inspect'" : function() {
            Should(ctx.response.headers).have.property('content-type', 'text/x-inspect');
        },
        "should have .output equal to 'Hello world.'" : function() {
            Should(ctx.output).eql('Hello world.');
        }
    }
  }
};


function ctxAndFittingDefGenerator(errStackFlag){
    ctx = {
        error: null,
        headers:{},
        response: {
            getHeader:getHeader,
            setHeader:setHeader,
            headers: {}
        },
        request: {
            swagger:{
                operation:{
                    produces:[
                        'application/json',
                        'text/x-inspect'
                    ]
                }
            }
        },
        statusCode: null,
        input: null,
        output: null
    };
    fittingDef = {
        includeErrStack: (errStackFlag)? true: false,
        beautifyJson :false
    }
}

function getHeader(key){
    return ctx.response.headers[key.toLowerCase()];
}

function setHeader(key, value){
    return ctx.response.headers[key.toLowerCase()] = value;
}