import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { AjusteCostoPromedio } from '@wms-interfaces/ajuste-costo-promedio';
import { DetalleAjusteCostoPromedioResponse, DetalleAjusteCostoPromedio } from '@wms-interfaces/detalle-ajuste-costo-promedio';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class AjusteCostoPromedioService {

  private srvcErrHndl: ServiceErrorHandler;
  private acpUrl = 'ajuste_costo_promedio';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<AjusteCostoPromedio[]> {
    return this.http.get<AjusteCostoPromedio[]>(
      `${GLOBAL.urlWms}/${this.acpUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: AjusteCostoPromedio) {
    return this.http.post<any>(`${GLOBAL.urlWms}/${this.acpUrl}/guardar${entidad.ajuste_costo_promedio ? ('/' + entidad.ajuste_costo_promedio) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getDetalle(fltr: any = {}): Observable<DetalleAjusteCostoPromedioResponse[]> {
    return this.http.get<DetalleAjusteCostoPromedioResponse[]>(
      `${GLOBAL.urlWms}/${this.acpUrl}/buscar_detalle?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveDetalle(entidad: DetalleAjusteCostoPromedio) {
    return this.http.post<any>(`${GLOBAL.urlWms}/${this.acpUrl}/guardar_detalle${entidad.detalle_ajuste_costo_promedio ? ('/' + entidad.detalle_ajuste_costo_promedio) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
  
  confirmar(idAjusteCostoPromedio: number): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlWms}/${this.acpUrl}/confirmar/${idAjusteCostoPromedio}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
    
}
