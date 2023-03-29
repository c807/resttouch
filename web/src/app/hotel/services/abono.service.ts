import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Abono, AbonoFormaPago } from '@hotel-interfaces/abono';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class AbonoService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'abono';

  constructor(
    private http: HttpClient
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<Abono[]> {
    return this.http.get<Abono[]>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

  save(entidad: Abono): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/guardar${!!entidad.abono ? ('/' + entidad.abono) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveDetalle(entidad: AbonoFormaPago): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/guardar_detalle${!!entidad.abono_forma_pago ? ('/' + entidad.abono_forma_pago) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getDetalle(fltr: any = {}): Observable<AbonoFormaPago[]> {
    return this.http.get<AbonoFormaPago[]>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/buscar_detalle?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

  limpiaDetalle(idAbono: number): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/limpia_detalle_abono/${idAbono}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

}
