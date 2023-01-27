import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Egreso } from '@wms-interfaces/egreso';
import { DetalleEgreso } from '@wms-interfaces/detalle-egreso';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class EgresoService {

  private srvcErrHndl: ServiceErrorHandler;
  private egresoUrl = 'egreso';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<Egreso[]> {
    return this.http.get<Egreso[]>(
      `${GLOBAL.urlWms}/${this.egresoUrl}/buscar_egreso?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: Egreso) {
    return this.http.post<any>(
      `${GLOBAL.urlWms}/${this.egresoUrl}/guardar${+entidad.egreso > 0 ? ('/' + entidad.egreso) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getDetalle(idegreso: number, fltr: any = {}): Observable<DetalleEgreso[]> {
    return this.http.get<DetalleEgreso[]>(
      `${GLOBAL.urlWms}/${this.egresoUrl}/buscar_detalle/${idegreso}?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveDetalle(entidad: DetalleEgreso) {
    return this.http.post<any>(
      `${GLOBAL.urlWms}/${this.egresoUrl}/guardar_detalle/${entidad.egreso}${+entidad.egreso_detalle > 0 ? ('/' + entidad.egreso_detalle) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  eliminarDetalle(idDetalle: number) {
    return this.http.get<any>(
      `${GLOBAL.urlWms}/${this.egresoUrl}/eliminar_detalle/${idDetalle}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }
}
