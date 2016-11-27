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
    "when used with ctx that has no error" : {
      "should lave ctx unchanged" : function() {
        var ctx = {};
        sut(ctx);
        Should(ctx).eql({});
      }
    },
    "when used with context that has an error" : {
      "and configured with truthful fittingDef.includeErrStack": {
        "and error does not have .statusCode" : {
          beforeAll: function(done){
            resetCtxAndFittingDef( /* use includeErrStack: */ true );
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
          "should have .message as the error message provided on the error object" : function() {
            Should(ctx.output.message).eql('Something unexpected has occurred.');
          },
          "should have .stack as Array of lines in the stack" : function() {
          Should(ctx.output.stack).be.an.Array();
        }
        },
        "and error has .statusCode ":{
          beforeAll: function(done){
            resetCtxAndFittingDef(true);
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
          "should have .statusCode set as the statusCode found on the error" : function() {
            Should(ctx.statusCode).eql(500);
          },
          "should have .message as the error message provided on the error object" : function() {
            Should(ctx.output.message).eql('Something unexpected has occurred.');
          },
          "should have .stack as Array of lines in the stack" : function() {
            Should(ctx.output.stack).be.an.Array();
          }
        }
      },
      "and configured with FALSEful fittingDef.includeErrStack ":{
        beforeAll: function(done){
          resetCtxAndFittingDef( /* use includeErrStack: */ false);
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

function resetCtxAndFittingDef(errStackFlag){
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
