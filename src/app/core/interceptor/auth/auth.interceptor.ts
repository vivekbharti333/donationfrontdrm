import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constant/constants';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly cookieService: CookieService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.cookieService.get('token');
    const isApplicationApi = request.url.startsWith(Constant.Site_Url);

    if (!token || !isApplicationApi || request.headers.has('Authorization')) {
      return next.handle(request);
    }

    return next.handle(
      request.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    );
  }
}
