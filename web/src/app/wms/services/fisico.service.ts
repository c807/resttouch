import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '../../shared/global';
import { ServiceErrorHandler } from '../../shared/error-handler';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class FisicoService {

  private srvcErrHndl: ServiceErrorHandler;
  private fisicoUrl = 'fisico';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  generarInventarioFisico(params: Object) {
    return this.http.post<any>(
      `${GLOBAL.urlWms}/${this.fisicoUrl}/generar`,
      params
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  confirmar(entidad: any) {
    return this.http.post<any>(
      `${GLOBAL.urlWms}/${this.fisicoUrl}/confirmar/${+entidad.inventario_fisico > 0 ? ('/' + entidad.inventario_fisico) : ''}`,
      {}
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getDetalle(idingreso: number, fltr: any = {}): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlWms}/${this.fisicoUrl}/buscar_detalle/${idingreso}?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveDetalle(params: any) {
    return this.http.post<any>(
      `${GLOBAL.urlWms}/${this.fisicoUrl}/actualizar/`,
      params
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
