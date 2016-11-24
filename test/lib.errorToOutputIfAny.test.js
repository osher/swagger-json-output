process.env.TEST_MODE = true;
var sut     = require('../').errorToOutputIfAny;
var request = require('mocha-ui-exports-request');
var ctx ;
var fittingDef ;

module.exports = { 
  "swagger-json-output~errorToOutputIfAny" : {
    "should be a function that names 2 arugment - ctx, fittingDef" : function() {
        Should(sut).be.a.Function().have.property("length", 2)
    },
    "when used with no error" : {
      "should  be unchanged" : function() {
        var ctx = {};
        sut(ctx);
        Should(ctx).eql({});
      }
    },
    "when used with error" : {
      "and use error stack": {
        beforeAll: function(done){
          ctxAndFittingDefGenerator(true);
          try {
            throw new Error("Something unexpected has occurred.");
          } catch (e) {
            ctx.error = e;
            sut(ctx,fittingDef);
            done();
          }
        },
        "should have .output" : function() {
          Should(ctx.output).be.an.Object();
        },
        "should have .message equal to 'Something unexpected has occurred.'" : function() {
          Should(ctx.output.message).eql('Something unexpected has occurred.');
        },
        "should have .stack" : function() {
          Should(ctx.output.stack).be.an.Array();
        }
      },
      "and use error stack and statusCode ":{
        beforeAll: function(done){
          ctxAndFittingDefGenerator(true);
          try {
            throw new Error("Something unexpected has occurred.");
          } catch (e) {
            ctx.error = e;
            ctx.error.statusCode = 500;
            sut(ctx,fittingDef);
            done();
          }
        },
        "should have .output" : function() {
          Should(ctx.output).be.an.Object();
        },
        "should have .statusCode equal 200" : function() {
          Should(ctx.statusCode).eql(500);
        },
        "should have .message equal to 'Something unexpected has occurred.'" : function() {
          Should(ctx.output.message).eql('Something unexpected has occurred.');
        },
        "should have .stack" : function() {
          Should(ctx.output.stack).be.an.Array();
        }
      },
      "and not use error stack ":{
        beforeAll: function(done){
          ctxAndFittingDefGenerator(false);
          try {
            throw new Error("Something unexpected has occurred.");
          } catch (e) {
            ctx.error = e;
            sut(ctx,fittingDef);
            done();
          }
        },
        "should have .output" : function() {
          Should(ctx.output).be.an.Object();
        },
        "should have .message equal to 'Something unexpected has occurred.'" : function() {
          Should(ctx.output.message).eql('Something unexpected has occurred.');
        },
        "should not have .stack" : function() {
          Should(!ctx.output.stack).be.ok();
        }
      }
    }
  }
};

function ctxAndFittingDefGenerator(errStackFlag){
  ctx = {
    error: null,
    response: {},
    request: {},
    statusCode: null,
    input: null,
    output: null
  };
  fittingDef = {
    includeErrStack: (errStackFlag)? true: false
  }
}
