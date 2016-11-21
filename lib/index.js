var merge = require('lodash/merge');
var debug = require('debug')('swagger:swagger-result');

module.exports = function openapi_result_fcty(fittingDef, bagpipes) {
    debug('created');
    var xJson = /json/;
    
    //TRICKY: prefer one load-time-if over if-per-request
    return fittingDef.beautifyJson
      ? function openapi_result(ctx, next) {
            debug('exec');

            assureStatusCode(ctx);
            assureCorrectResponseContentType(ctx);
            errorToOutputIfAny(ctx, fittingDef);

            beautifyJsonContents(ctx, fittingDef);
            
            next(null, ctx.output);
        }
      : function openapi_result(ctx, next) {
            debug('exec');

            assureStatusCode(ctx);
            assureCorrectResponseContentType(ctx);
            errorToOutputIfAny(ctx, fittingDef);
            
            next(null, ctx.output);
        };
    
    function assureStatusCode(ctx) {
        var err = ctx.error;
        var res = ctx.response;

        if (err) { //i.e - error code must be above 400
            //escalate statusCode. 
            // First higher than 400 is used
            //   1. - ctx.statusCode 
            //   2. - res.statusCode (left by low level mw)
            //   3. - ctx.error.statusCode (thrown with status code)
            // Else - use default: 500
            switch(true) {
              case ctx.statusCode && ctx.statusCode >= 400:
                return;
                
              case res.statusCode && res.statusCode >= 400:
                ctx.statusCode = res.statusCode;
                return;
                
              case err.statusCode && err.statusCode >= 400:
                ctx.statusCode = err.statusCode;
                return;

              default:
                ctx.statusCode = 500;
            }
        };
        
        if (!ctx.statusCode) ctx.statusCode = 200;
    }
    
    function errorToOutputIfAny(ctx, fittingDef) {
        var err = ctx.error;

        if (!err) return;

        //leave error to the frameworks' default error handler
        if (!fittingDef.includeErrObject) return;
        
        delete ctx.error;
        //decouple error view from Error object
        //and make sure stack and message enumerate
        ctx.output = merge({
          message:  err.message,
          stack:    err.stack && err.stack.split("\n")
        }, err);
    }

    function assureCorrectResponseContentType(ctx) {
        var operation   = ctx.request.swagger.operation;
        var produces    = operation.produces;
        var contentType = ctx.response.getHeader("content-type");

        if (  contentType
           && ~produces.indexOf(contentType)
           )
            return;
        
        if (contentType) {
            ctx.log.warn({
              operationPath:      operation.path,
              operationProduces:  produces,
              foundType:          contentType
            }, "auto correcting content-type: [%s] does not match produces [%s] of operation: [%s]" , contentType, produces, operation.path);
        }

        contentType = ctx.request.headers.accept;

        if (!contentType || "*/*" == contentType)
            contentType = produces[0];

        if (contentType)
            ctx.response.setHeader("content-type", contentType);
    }    

    function beautifyJsonContents(ctx) {
        var type = ctx.response.getHeader("content-type")
        if( !xJson.test(type) ) 
            return debug("not beautified", type);
          
        debug("exec", type);
        
        try {
            ctx.output = JSON.stringify(ctx.output, null, 2)
        } catch (ex) {
            debug("unable to stringify body", ctx.output);
            ctx.statusCode = 500;
            ctx.output = JSON.stringify({
              message:        "unable to stringify body properly",
              stringifyErr:   ex.message,
              bodyInspect:    
                util.inspect(err, { depth: 10, breakLength: 1 } )
                    .split("\n")
            }, null, 2)
        }
    }
}
