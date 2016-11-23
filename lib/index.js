var util  = require('util');
var merge = require('lodash/merge');
var debug = require('debug')('swagger:swagger-result');
var xJson = /json/;

exports = module.exports = openapi_result_fcty;

if (process.env.TEST_MODE) {
    openapi_result_fcty.assureStatusCode = assureStatusCode;
    openapi_result_fcty.assureCorrectResponseContentType = assureCorrectResponseContentType;
    openapi_result_fcty.errorToOutputIfAny = errorToOutputIfAny;
    openapi_result_fcty.beautifyJsonContents = beautifyJsonContents;
}

function openapi_result_fcty(fittingDef, bagpipes) {
    debug('created');
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
}

function assureStatusCode(ctx) {
    var err = ctx.error;
    var res = ctx.response;

    if (err) { //i.e - error code must be above 400
        //escalate statusCode. 
        // First higher than 400 is used
        //   1. - ctx.statusCode (left for us by pipe-fitting or user controller)
        //   2. - res.statusCode (left for us by other low level mw)
        //   3. - ctx.error.statusCode/status (error thrown with statusCode/status)
        // Else - use default: 500
        switch(true) {
          case ctx.statusCode >= 400:
            //cool. we're there
            return;
            
          case res.statusCode >= 400:
            ctx.statusCode = res.statusCode;
            return;
            
          case statusIn(err) >= 400:
            ctx.statusCode = err.statusCode || err.status;
            return;

          default:
            ctx.statusCode = 500;
        }
    };
    
    if (!ctx.statusCode) ctx.statusCode = 200;
    
    function statusIn(err) {
        //TRICKY: sails is different - it uses .status instead of .statusCode
        return err.statusCode || err.status
    }
}

function errorToOutputIfAny(ctx, fittingDef) {
    var err = ctx.error;

    if (!err) return;

    delete ctx.error;

    if (err.statusCode) {
        ctx.statusCode = err.statusCode;
        delete err.statusCode;
    }
    
    //decouple error view from Error object
    //and make sure stack and message enumerate
    ctx.output = merge({
      message:  err.message,
      stack:    fittingDef.includeErrStack && err.stack && err.stack.split("\n") || undefined
    }, err);
    
}

function assureCorrectResponseContentType(ctx) {
    var operation   = ctx.request.swagger.operation;
    var produces    = operation.produces;
    var contentType = ctx.headers["content-type"];
    if (  contentType
       && ~produces.indexOf(contentType)
       )
        return ctx.response.setHeader("content-type", contentType);

    if (contentType) warnAboutBadContentType("context");
        
    contentType = ctx.response.getHeader("content-type");
    if (  contentType
       && ~produces.indexOf(contentType)
       )
        return ctx.headers["content-type"] = contentType;
    
    if (contentType) warnAboutBadContentType("response.getHeader");

    contentType = ctx.request.headers.accept;

    if (!contentType || "*/*" == contentType)
        contentType = produces[0];

    if (contentType) {
        ctx.headers["content-type"] = contentType;
        ctx.response.setHeader("content-type", contentType);
    }

    function warnAboutBadContentType(at) {
        var log = ctx.log || ctx.request.log || console;
        
        (log.warn || log.error)({
          operationPath:      operation.path,
          operationProduces:  produces,
          foundType:          contentType,
          foundAt:            at,
        }, "auto correcting content-type: [%s] does not match produces [%s] of operation: [%s]" , contentType, produces, operation.path);      
    }
}    

function beautifyJsonContents(ctx, fittingDef) {
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
          inspect:    
            util.inspect(ctx.output, { depth: 10, breakLength: 1 } )
                .split("\n")
        }, null, 2);
    }
}
