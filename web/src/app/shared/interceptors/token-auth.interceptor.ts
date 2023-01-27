import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GLOBAL } from '@shared/global';

import { LocalstorageService } from '@admin-services/localstorage.service';

@Injectable()
export class TokenAuthInterceptor implements HttpInterceptor {
    constructor(
        private ls: LocalstorageService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const currentUser = this.ls.get(GLOBAL.usrTokenVar);
        if (currentUser && currentUser.token) {
            request = request.clone({
                setHeaders: {
                    Authorization: currentUser.token
                }
            });
        }

        return next.handle(request);
    }
}
