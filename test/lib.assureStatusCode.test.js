process.env.TEST_MODE = true;
var sut     = require('../').assureStatusCode;
var request = require('mocha-ui-exports-request');
var ctx;

module.exports = { 
  "swagger-json-output~assureStatusCode" : {
    "should be a function that names 1 arugment - ctx" : function() {
        Should(sut).be.a.Function().have.property("length", 1)
    },
    "when used context that has with no error" : {
      "should have .statusCode 200" : function() {
        ctx = {
          error: null,
          response: {},
          request: {},
          statusCode: null,
          input: null,
          output: null
        };
        sut(ctx);
        Should(ctx.statusCode).eql(200);
      }
    },
    "when used with context that has an error" : {
      "and provide ctx.statusCode bigger than 400":{
        "should leave statusCode found on ctx" : function() {
          ctx = {
            error: true,
            response: {},
            request: {},
            statusCode: 404,
            input: null,
            output: null
          };
          sut(ctx);
          Should(ctx.statusCode).eql(404);
        }
      },
      "and provide response.statusCode bigger than 400":{
        "should have ctx.statusCode set after response.statusCode" : function() {
          ctx = {
            error: true,
            response: {
              statusCode: 450
            },
            request: {},
            statusCode: null,
            input: null,
            output: null
          };
          sut(ctx);
          Should(ctx.statusCode).eql(450);
        }
      },
      "and ctx.error has .statusCode or .status":{
        "should  have .statusCode bigger 400" : function() {
          ctx = {
            error: {
              status:505
            },
            response: {},
            request: {},
            statusCode: null,
            input: null,
            output: null
          };
          sut(ctx);
          Should(ctx.statusCode).eql(505);
        }
      },
      "and .statusCode on error and on ctx is not found or smaller than 400":{
        "use default statusCode - as 500" : function() {
          ctx = {
            error: { statusCode: 301 },
            response: {},
            request: {},
            statusCode: 201,
            input: null,
            output: null
          };
          sut(ctx);
          Should(ctx.statusCode).eql(500);
        }
      }
    }
  }
};
