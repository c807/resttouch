import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ServiceErrorHandler } from '@shared/error-handler';
import { GLOBAL } from '@shared/global';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BitacoraService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'bitacora';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  getTablas(): Observable<any[]> {
    return this.http.get<any[]>(`${GLOBAL.url}/${this.moduleUrl}/get_tablas_bitacora`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  reporte(params: Object) {
    const httpOptions = {
      headers: new HttpHeaders({
        Accept: 'application/pdf'
      }),
      responseType: 'blob' as 'json'
    };

    return this.http.post<string>(
      `${GLOBAL.url}/${this.moduleUrl}/reporte`,
      params,
      httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
