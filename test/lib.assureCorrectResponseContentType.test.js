process.env.TEST_MODE = true;
var sut     = require('../').assureCorrectResponseContentType;
var request = require('mocha-ui-exports-request');
var ctx, fittingDef;

module.exports = { 
  "swagger-json-output~assureCorrectResponseContentType" : {
    "should be a function that names 1 arugment - ctx" : function() {
        Should(sut).be.a.Function().have.property("length", 1)
    },
    "when used with content-type of headers" : {
        beforeAll: function(done){
            ctxAndFittingDefGenerator(true);
            ctx.headers["content-type"] = 'application/json';
            sut(ctx, fittingDef);
            done();
        },
        "should correct 'content-type' to 'application/json'" : function() {
          Should(ctx.response.headers).have.property('content-type', 'application/json');
        }
    },
    "when used with content-type of response headers" : {
        beforeAll: function(done){
            ctxAndFittingDefGenerator(true);
            ctx.headers = {};
            ctx.response.headers['content-type'] = 'text/x-inspect';
            sut(ctx, fittingDef);
            done();
        },
        "should correct 'content-type' to 'text/x-inspect'" : function() {
            Should(ctx.headers).have.property('content-type', 'text/x-inspect');
        }
      },
      "when used with accept of request" : {
        "and include all media types":{
            beforeAll: function(done){
                ctxAndFittingDefGenerator(true);
                ctx.request.headers = {
                      accept:'*/*'
                };
                ctx.response.headers ={};
                ctx.headers ={};
                sut(ctx, fittingDef);
                done();
              },
            "should correct 'content-type' to 'application/json'" : function() {
                Should(ctx.response.headers).have.property('content-type', 'application/json');
                Should(ctx.headers).have.property('content-type', 'application/json');
            }
        },
        "and include 'text/plain'":{
            beforeAll: function(done){
                ctxAndFittingDefGenerator(true);
                ctx.request.headers = {
                      accept:'text/plain'
                };
                ctx.response.headers ={};
                ctx.headers ={};
                sut(ctx, fittingDef);
                done();
              },
            "should correct 'content-type' to 'application/json'" : function() {
                Should(ctx.response.headers).have.property('content-type', 'text/plain');
                Should(ctx.headers).have.property('content-type', 'text/plain');
            }
        }
    }
  }
};


function ctxAndFittingDefGenerator(errStackFlag){
  ctx = {
    error: null,
    headers:{

    },
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
    includeErrStack: (errStackFlag)? true: false
  }
}

function getHeader(key){
  return ctx.response.headers[key.toLowerCase()];
}

function setHeader(key, value){
  return ctx.response.headers[key.toLowerCase()] = value;
}