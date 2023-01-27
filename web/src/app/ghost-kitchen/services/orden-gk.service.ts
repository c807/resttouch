import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { OrdenGkResponse } from '@ghost-kitchen-interfaces/orden-gk';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class OrdenGkService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'orden_gk';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  seguimiento(fltr: any = {}): Observable<OrdenGkResponse[]> {
    return this.http.get<OrdenGkResponse[]>(
      `${GLOBAL.urlGhostKitchen}/${this.moduleUrl}/seguimiento?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  anular(params: any): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlGhostKitchen}/${this.moduleUrl}/anular_orden_gk`, params
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  enviarVendors(params: any): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlGhostKitchen}/${this.moduleUrl}/envio_vendors`, params
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

  cambiarEstatus(params: any): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlGhostKitchen}/${this.moduleUrl}/cambiar_estatus`, params
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  cambiarEstatusSede(idOrdenGk: number): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlGhostKitchen}/${this.moduleUrl}/actualiza_estatus_sede/${idOrdenGk}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  regeneraOrdenRT(idOrdenGk: number): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlGhostKitchen}/${this.moduleUrl}/regenera_orden_rt/${idOrdenGk}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

}
