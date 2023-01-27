import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Ingreso } from '@wms-interfaces/ingreso';
import { DetalleIngreso } from '@wms-interfaces/detalle-ingreso';
import { Documento } from '@wms-interfaces/documento';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class IngresoService {

  private srvcErrHndl: ServiceErrorHandler;
  private ingresoUrl = 'ingreso';
  private documentoUrl = 'documento';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<Ingreso[]> {
    return this.http.get<Ingreso[]>(
      `${GLOBAL.urlWms}/${this.ingresoUrl}/buscar_ingreso?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: Ingreso) {
    return this.http.post<any>(
      `${GLOBAL.urlWms}/${this.ingresoUrl}/guardar${+entidad.ingreso > 0 ? ('/' + entidad.ingreso) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getDetalle(idingreso: number, fltr: any = {}): Observable<DetalleIngreso[]> {
    return this.http.get<DetalleIngreso[]>(
      `${GLOBAL.urlWms}/${this.ingresoUrl}/buscar_detalle/${idingreso}?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveDetalle(entidad: DetalleIngreso) {
    return this.http.post<any>(
      `${GLOBAL.urlWms}/${this.ingresoUrl}/guardar_detalle/${entidad.ingreso}${+entidad.ingreso_detalle > 0 ? ('/' + entidad.ingreso_detalle) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getDocumento(fltr: any = {}): Observable<Documento[]> {
    return this.http.get<Documento[]>(
      `${GLOBAL.urlWms}/${this.documentoUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveDocumento(entidad: Documento) {
    return this.http.post<any>(
      `${GLOBAL.urlWms}/${this.documentoUrl}/guardar${+entidad.documento > 0 ? ('/' + entidad.documento) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  enviarDocumentoAConta(idDocumento: number) {
    return this.http.get<any>(
      `${GLOBAL.urlWms}/${this.documentoUrl}/enviar/${idDocumento}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  eliminarDetalle(idDetalle: number) {
    return this.http.get<any>(
      `${GLOBAL.urlWms}/${this.ingresoUrl}/eliminar_detalle/${idDetalle}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

}
