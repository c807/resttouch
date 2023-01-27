import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Transformacion } from '@wms-interfaces/transformacion';
import { TransformacionIngreso } from '@wms-interfaces/transformacion';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TransformacionService {

  private srvcErrHndl: ServiceErrorHandler;
  private conversorUrl = 'conversor';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  transformar(entidad: Transformacion): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlWms}/${this.conversorUrl}/transformar`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  producir(entidad: TransformacionIngreso): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlWms}/${this.conversorUrl}/producir`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
