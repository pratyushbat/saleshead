"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delayedRetry = exports.delayedRetryHttp = void 0;
var http_1 = require("@angular/common/http");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var DEFAULT_MAX_RETRIES = 2;
var DEFAULT_DELAY = 3000;
var getErrorMessage = function (maxRetry) { return "Tried to load Resource " + maxRetry + " times without success. Giving up."; };
var getHttpError = function (errorResponse) { return new http_1.HttpErrorResponse({
    error: errorResponse.error,
    headers: errorResponse.headers,
    status: errorResponse.status,
    statusText: errorResponse.statusText,
    url: errorResponse.url
}); };
function delayedRetryHttp(delayMs, maxRetry) {
    if (delayMs === void 0) { delayMs = DEFAULT_DELAY; }
    if (maxRetry === void 0) { maxRetry = DEFAULT_MAX_RETRIES; }
    var retries = maxRetry;
    return function (src) {
        return src.pipe(operators_1.retryWhen(function (errors) {
            return errors.pipe(operators_1.delay(delayMs), operators_1.mergeMap(function (error) {
                return (retries-- > 0 ? rxjs_1.of(error) : rxjs_1.throwError(error));
            }));
        }));
    };
}
exports.delayedRetryHttp = delayedRetryHttp;
function delayedRetry(delayMs, maxRetry) {
    if (maxRetry === void 0) { maxRetry = DEFAULT_MAX_RETRIES; }
    var retries = maxRetry;
    return function (src) {
        return src.pipe(operators_1.retryWhen(function (errors) { return errors.pipe(operators_1.delay(delayMs), operators_1.mergeMap(function (error) { return retries-- > 0 ? rxjs_1.of(error) : rxjs_1.throwError(getErrorMessage(maxRetry)); })); }));
    };
}
exports.delayedRetry = delayedRetry;
//# sourceMappingURL=delayedRetry.js.map