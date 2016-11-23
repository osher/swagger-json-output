process.env.TEST_MODE = true;
var sut     = require('../').assureStatusCode;
var request = require('mocha-ui-exports-request');

module.exports = { 
  "swagger-json-output~assureStatusCode" : {
    "should be a function that names 1 arugment - ctx" : function() {
        Should(sut).be.a.Function().have.property("length", 1)
    },
    "when used with no error" : {
      "should  have .statusCode 200" : function() {
        var ctx = {
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
    "when used with error" : {
      "and  provide ctx.statusCode":{
        "should  have .statusCode bigger 400" : function() {
          var ctx = {
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
      "and  provide response.statusCode":{
        "should  have .statusCode bigger 400" : function() {
          var ctx = {
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
      "and  provide err.status":{
        "should  have .statusCode bigger 400" : function() {
          var ctx = {
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
      "and  use default statusCode":{
        "should  have .statusCode equal 500" : function() {
          var ctx = {
            error: {},
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
