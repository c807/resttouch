import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Campo } from '@restaurante-interfaces/autoconsulta';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})

export class AutoconsultaService {
  private srvcErrHndl: ServiceErrorHandler;

  constructor(
    private http: HttpClient
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  getCampos(fltr: any = {}): Observable<Campo[]> {
    return this.http.get<Campo[]>(
      `${GLOBAL.urlCatalogos}/get_campos?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getReporte(fltr: any = {}) {
    const httpOptions = {
      headers: new HttpHeaders({
        Accept: 'application/vnd.ms-excel'
      }),
      responseType: 'blob' as 'json'
    };
    return this.http.post<string>(
      `${GLOBAL.urlAppRestaurante}/reporte/autoconsulta`,
      fltr,
      httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
