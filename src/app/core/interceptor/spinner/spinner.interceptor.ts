import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { catchError, finalize, Observable, throwError } from 'rxjs';
import { SpinnerService } from '../../core.index';
import { SKIP_GLOBAL_SPINNER } from './spinner-context';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {
  constructor(private spinner: SpinnerService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (request.context.get(SKIP_GLOBAL_SPINNER)) {
      return next.handle(request);
    }
    this.spinner.show();
    return next.handle(request).pipe(
      finalize(() => {
        this.spinner.hide();
      }),
      catchError((error) => {
        if (error) {
          this.spinner.hide();
        }
        return throwError(error);
      })
    );
  }
}
