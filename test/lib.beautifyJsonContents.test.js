process.env.TEST_MODE = true;
var sut     = require('../').beautifyJsonContents;
var request = require('mocha-ui-exports-request');
var ctx, fittingDef;

module.exports = { 
  "swagger-json-output~beautifyJsonContents" : {
    "should be a function that names 2 arugment - ctx, fittingDef" : function() {
        Should(sut).be.a.Function().have.property("length", 2)
    },
    "when used with context that specifies content-type 'text/x-inspect' in ctx.headers" : {
      beforeAll: function(done){
        ctxAndFittingDefGenerator(true);
        ctx.headers["content-type"] = 'text/x-inspect';
        sut(ctx, fittingDef);
        done();
      },
      "should not have ctx.output overridden" : function() {
        Should(ctx.output).be.an.Object();
      },

      "when used with context that specifies content-type 'application/json' in ctx.headers" : {
        beforeAll: function(done){
          ctxAndFittingDefGenerator(true);
          ctx.headers["content-type"] = 'application/json';
          sut(ctx, fittingDef);
          done();
        },
        "should have ctx.output and ctx.output type changed to string" : function() {
          Should(ctx.output).be.an.String();
        },
        "should convert to JSON" : function() {
          Should(JSON.parse(ctx.output)).be.an.Object();
        }
      },

      "when used with ctx.output is circular object" : {
        beforeAll: function(done){
          ctxAndFittingDefGenerator(true);
          ctx.headers["content-type"] = 'application/json';
          var obj = {};
          obj.a = {b:obj};
          ctx.output = obj;
          sut(ctx, fittingDef);
          done();
        },
        "should have .statusCode equal 500" : function() {
          Should(ctx.statusCode).eql(500);
        },
        "should have ctx.output " : function() {
          Should(JSON.parse(ctx.output)).be.an.Object();
        },
        "should have ctx..message equal to 'unable to stringify body properly'" : function() {
          Should(JSON.parse(ctx.output).message).eql('unable to stringify body properly');
        },
        "should have ctx..stringifyErr equal to 'Converting circular structure to JSON'" : function() {
          Should(JSON.parse(ctx.output).stringifyErr).eql('Converting circular structure to JSON');
        }
      }
    }
  }
};

function ctxAndFittingDefGenerator(errStackFlag){
  ctx = {
    error: null,
    headers:{},
    response: {},
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