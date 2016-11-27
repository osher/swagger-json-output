process.env.TEST_MODE = true;
var sut     = require('../').beautifyJsonContents;
var request = require('mocha-ui-exports-request');
var ctx, fittingDef;

module.exports = { 
  "swagger-json-output~beautifyJsonContents" : {
    "should be a function that names 2 arugment - ctx, fittingDef" : function() {
        Should(sut).be.a.Function().have.property("length", 2)
    },
    "when used with content type not JSON" : {
      beforeAll: function(done){
        ctxAndFittingDefGenerator(true);
        ctx.response.headers["content-type"] = 'text/x-inspect';
        sut(ctx, fittingDef);
        done();
      },
      "should not have .output overriden" : function() {
        Should(ctx.output).be.an.Object();
      },

      "when used with content type JSON" : {
        beforeAll: function(done){
          ctxAndFittingDefGenerator(true);
          ctx.response.headers["content-type"] = 'application/json';
          sut(ctx, fittingDef);
          done();
        },
        "should have .output and .output type changed to string" : function() {
          Should(ctx.output).be.an.String();
        },
        "should convert to JSON" : function() {
          Should(JSON.parse(ctx.output)).be.an.Object();
        }
      },

      "when used with error" : {
        beforeAll: function(done){
          ctxAndFittingDefGenerator(true);
          ctx.response.headers["content-type"] = 'application/json';
          var obj = {};
          obj.a = {b:obj};
          ctx.output = obj;
          sut(ctx, fittingDef);
          done();
        },
        "should have .statusCode equal 500" : function() {
          Should(ctx.statusCode).eql(500);
        },
        "should have .output " : function() {
          Should(JSON.parse(ctx.output)).be.an.Object();
        },
        "should have .message equal to 'unable to stringify body properly'" : function() {
          Should(JSON.parse(ctx.output).message).eql('unable to stringify body properly');
        },
        "should have .stringifyErr equal to 'Converting circular structure to JSON'" : function() {
          Should(JSON.parse(ctx.output).stringifyErr).eql('Converting circular structure to JSON');
        }
      }
    }
  }
};

function ctxAndFittingDefGenerator(errStackFlag){
  ctx = {
    error: null,
    response: {
      getHeader:getHeader,
      headers: {}
    },
    request: {},
    statusCode: null,
    input: null,
    output: {
      data: 'Hello world!'
    }
  };
  fittingDef = {
    includeErrStack: (errStackFlag)? true: false
  }
}

function getHeader(key){
  return ctx.response.headers[key.toLowerCase()];
}