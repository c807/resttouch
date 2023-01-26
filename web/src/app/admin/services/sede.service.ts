import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Corporacion, Sede, Empresa } from '@admin-interfaces/sede';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class SedeService {

  private srvcErrHndl: ServiceErrorHandler;
  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<Sede[]> {
    return this.http.get<Sede[]>(
      `${GLOBAL.urlCatalogos}/get_sede?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveSede(obj: Sede): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/sede/guardar${!!obj.sede ? ('/' + obj.sede) : ''}`,
      obj
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getCorporacion(fltr: any = {}): Observable<Corporacion[]> {
    return this.http.get<Corporacion[]>(
      `${GLOBAL.urlMantenimientos}/corporacion/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveCorporacion(obj: Corporacion): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/corporacion/guardar${!!obj.corporacion ? ('/' + obj.corporacion) : ''}`,
      obj
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getEmpresa(fltr: any = {}): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(
      `${GLOBAL.urlMantenimientos}/empresa/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveEmpresa(obj: Empresa): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/empresa/guardar${!!obj.empresa ? ('/' + obj.empresa) : ''}`,
      obj
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

}
