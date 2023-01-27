import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Bodega } from '@wms-interfaces/bodega';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class BodegaService {

  private srvcErrHndl: ServiceErrorHandler;

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<Bodega[]> {
    return this.http.get<Bodega[]>(
      `${GLOBAL.urlCatalogos}/get_bodega?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: Bodega) {
    return this.http.post<any>(`${GLOBAL.urlMantenimientos}/bodega/guardar${entidad.bodega ? ('/' + entidad.bodega) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  darDeBaja(idBodega: number): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlMantenimientos}/bodega/dar_de_baja/${idBodega}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
