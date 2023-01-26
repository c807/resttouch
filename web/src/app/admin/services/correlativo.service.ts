import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Correlativo } from '@admin-interfaces/correlativo';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class CorrelativoService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'correlativo';  

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<Correlativo> {   
    return this.http.get<Correlativo>(
      `${GLOBAL.url}/${this.moduleUrl}/get_correlativo?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
