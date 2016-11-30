process.env.TEST_MODE = true;
var sut     = require('../').preOutput;
var request = require('mocha-ui-exports-request');
var fittingDef;
var ctx, cloneCtx;

module.exports = {
    "swagger-json-output~preOutput" : {
        "should be a function that names 1 arugment - ctx" : function() {
            Should(sut).be.a.Function().have.property("length", 1)
        },
        "when used with ctx._preOutput is null" : {
            beforeAll: function(done){
                ctxAndFittingDefGenerator(true);
                ctx.request.headers = {
                    accept:'text/x-inspect'
                };
                ctx.output = 'Hello world.';
                cloneCtx = Object.assign({}, ctx);
                sut(ctx);
                done();

            },
            "Should not changed":function(){
                Should(ctx).eql(cloneCtx);
            }
        },
        "when used with ctx._preOutput is a function" : {
            beforeAll: function(done){
                ctxAndFittingDefGenerator(true);
                ctx.request.headers = {
                    accept:'text/x-inspect'
                };
                ctx.output = 'Hello world.';
                ctx._preOutput = preOutput;
                sut(ctx);
                done();

            },
            "Should have ctx.output changed":function(){
                Should(ctx.output).eql('context was changed');
            }
        },
        "when used with ctx._preOutput is not a function" : {
            beforeAll: function(done){
                ctxAndFittingDefGenerator(true);
                ctx.request.headers = {
                    accept:'text/x-inspect'
                };
                ctx.output = 'Hello world.';
                ctx._preOutput = 'Not a function';
                sut(ctx);
                done();

            },
            "Should have ctx.output":function(){
                Should(ctx.output).be.an.Object();
            },
            "Should have ctx.output.message":function(){
                Should(ctx.output.message).eql('unable use preOutput');
            },
            "Should have ctx.output.error":function(){
                Should(ctx.output.error).eql('ctx._preOutput is not a function');
            },
            "Should have ctx.statusCode equal 500":function(){
                Should(ctx.statusCode).eql(500);
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
        output: null,
        _preOutput: null
    };
    fittingDef = {
        includeErrStack: (errStackFlag)? true: false
    }
}

function getHeader(key){
    return ctx.response.headers[key.toLowerCase()];
}

function setHeader(key, value){
    return ctx.response.headers[key.toLowerCase()] = value;
}

function preOutput(key){
    return ctx.output = 'context was changed';
}