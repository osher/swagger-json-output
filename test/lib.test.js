var sut = require('../')

module.exports = { 
  "swagger-result" : { 
    "should be a factory function that names 2 arguments - fittingDef, bagpipes" : function() {
        Should(sut)
          .be.a.Function()
          .have.property("length", 2)
    },
    "when used with fittingDef and bagpipes" : {
      "should return a startegy function that names 2 arguments - ctx, next" :  function() {
          Should(sut({},{}))
            .be.a.Function()
            .have.property("length", 2)            
      },
    },
    "when named as last step on controller pipe for operation that produces `application/json`" : {
      "and controller leaves ctx.output that cannot be serialized" : serializationErrorSuire({}),
      "and controller leaves ctx.output that serializes successfully" : serializationOkSuite({})
    },
    "when named as onError pipe handler for operations that produce `application/json`" : {
      "and a fitting in the pipe leaves error on context" : errorCaseSuite({}),
      "and a fitting in the pipe throws error" : errorCaseSuite({}),
      "and a fitting in the pipe yields an error" : errorCaseSuite({}),
      "and no error is yielded, thrown or left on cotnext" : serializationOkSuite({}),
      "and content-type left on the response does not match the content-type declared by produces" : {
        "should correct the content-type" : null,
        "and a logger is found on the request" : {
          "should emit a warning to the requet logger" : null
        }
      }
    }
  }
}

function errorCaseSuite(ctx) {
    
    return {
      beforeAll: function(done) {
          //TODO - run setup
          //ctx.results = {
          //  statusCode: 
          // }
          done()
      },
      "and fittingDef.beautifyJson is falsful" : {
        "should leave the error to the framework's default handler"  : null
      },
      "and fittingDef.beautifyJson is truthful" : {
        "and context.statusCode is set to a code >= 400" : {
          "response statusCode should be the ctx.statusCode" : null
        },
        "and context.statusCode is NOT set to a code >= 400" : {
          "and response.statusCode is set to a code >= 400" : {
            "response statusCode should be the value on response.statusCode" : null
          },
          "and response.statusCode is NOT set to a code >= 400" : {
            "and error object has .statusCode" : {
              "response statusCode should be the value on error.statusCode" : null
            }, 
            "and error.statusCode is NOT set to a code >= 400" : {
              "response statusCode should be 500" : null
            }
          }
        },
        "and error object is serializable" : {
          "response.statusCode should be preserved as found by statusCode logic" : null,
          "response.body" : {
            "should have .message as the error message" : null,
            "should have .stack as error.stack split by new-line": null,
            "should include any enumerable attribute error was decorated with": null
          }
        },
        "and error object is not serializable" : serializationErrorSuire(ctx)
      }
    }
}

function serializationErrorSuire(ctx) {
    return {
      "response.statusCode should be 500" : null,
      "response.body" : {
        "should have .message : unable to stringify body properly" : null,
        "should have .stringifyErr as the message of stringification error" : null,
        "should have .bodyInspect as util.inspect of the error, split by new-line" : null
      }
    }
}

function serializationOkSuite(ctx) { 
    return {
      "statusCode should be as meant by controller method" : null,
      "body should be as passed by controller method" : null
    }
}