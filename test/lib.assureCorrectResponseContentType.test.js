process.env.TEST_MODE = true;
var sut     = require('../').assureCorrectResponseContentType;
var request = require('mocha-ui-exports-request');
var fs      = require('fs');
var ctx, fittingDef;

module.exports = { 
  "swagger-json-output~assureCorrectResponseContentType" : {
    "should be a function that names 1 arugment - ctx" : function() {
        Should(sut).be.a.Function().have.property("length", 1)
    },
    "when used with context that specifies content-type 'application/json' in ctx.headers" : {
        beforeAll: function(done){
            ctxAndFittingDefGenerator(true);
            ctx.headers["content-type"] = 'application/json';
            sut(ctx, fittingDef);
            done();
        },
        "should correct 'content-type' on response.headers to 'application/json'" : function() {
          Should(ctx.response.headers).have.property('content-type', 'application/json');
        }
    },
    "when used with ctx.request that specifies content-type in response headers" : {
        beforeAll: function(done){
            ctxAndFittingDefGenerator(true);
            ctx.headers = {};
            ctx.response.headers['content-type'] = 'text/x-inspect';
            sut(ctx, fittingDef);
            done();
        },
        "should correct 'content-type' on ctx.headers to same type as found in request.headers" : function() {
            Should(ctx.headers).have.property('content-type', 'text/x-inspect');
        }
      },
      "when used with request that has Http header Accept" : {
        "with wildcard value (accept all media types)":{
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
        "with specific content-type that is not 'applicaiton/json' (but is a part of the produces)":{
            beforeAll: function(done){
                ctxAndFittingDefGenerator(true);
                ctx.headers["content-type"] = 'X';
                ctx.request.headers = {
                      accept:'text/x-inspect'
                };
                ctx.response.headers ={};
                sut(ctx, fittingDef);
                done();
              },
            "should correct 'content-type' on the context to the type found on Accept HTTP header" : function() {
                Should(ctx.response.headers).have.property('content-type', 'text/x-inspect');
                Should(ctx.headers).have.property('content-type', 'text/x-inspect');
            },
            "should warn about overwriten content-type" : function(){
                var contents = fs.readFileSync('unit-test-log.log', 'utf8');
                Should(contents).be.an.String();
            }
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
                ],
                path: '/foo'
            }
        }
    },
    statusCode: null,
    input: null,
    output: null,
    log:{
        warn:warn
    }
  };
  fittingDef = {
    includeErrStack: (errStackFlag)? true: false
  }
}

function warn(obj, message, v1, v2 ,v3){
    message = message.replace("[%s]", v1);
    message = message.replace("[%s]", v2);
    message = message.replace("[%s]", v3);
    fs.writeFileSync("unit-test-log.log", message);
}

function getHeader(key){
  return ctx.response.headers[key.toLowerCase()];
}

function setHeader(key, value){
  return ctx.response.headers[key.toLowerCase()] = value;
}