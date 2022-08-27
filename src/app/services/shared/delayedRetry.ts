import { HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable, of } from 'rxjs';
import { delay, mergeMap, retryWhen } from 'rxjs/operators';

const DEFAULT_MAX_RETRIES: number = 2;
const DEFAULT_DELAY: number = 3000;
const getErrorMessage = (maxRetry: number) => `Tried to load Resource ${maxRetry} times without success. Giving up.`;

const getHttpError = (errorResponse: HttpErrorResponse) => new HttpErrorResponse({
  error: errorResponse.error,
  headers: errorResponse.headers,
  status: errorResponse.status,
  statusText: errorResponse.statusText,
  url: errorResponse.url
});

export function delayedRetryHttp(delayMs: number = DEFAULT_DELAY, maxRetry = DEFAULT_MAX_RETRIES) {
  let retries = maxRetry;

  return (src: Observable<any>) =>
    src.pipe(
      retryWhen((errors: Observable<any>) => {
        return errors.pipe(
          delay(delayMs),
          mergeMap((error: HttpErrorResponse) => {
            return (retries-- > 0 ? of(error) : throwError(error));
          }))
      }
      )
    );
}

export function delayedRetry(delayMs: number, maxRetry = DEFAULT_MAX_RETRIES) {
  let retries = maxRetry;

  return (src: Observable<any>) =>
    src.pipe(
      retryWhen((errors: Observable<any>) => errors.pipe(
        delay(delayMs),
        mergeMap(error => retries-- > 0 ? of(error) : throwError(getErrorMessage(maxRetry))
        ))
      )
    );
}
