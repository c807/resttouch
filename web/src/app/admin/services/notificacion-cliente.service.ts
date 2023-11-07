import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { NotificacionCliente, ClienteRT } from '@admin-interfaces/notificacion-cliente';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionClienteService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'notificacion_cliente';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(pordominio = false): Observable<NotificacionCliente[]> {
    return this.http.get<NotificacionCliente[]>(
      `${GLOBAL.urlCatalogos}/get_notificaciones_cliente${pordominio ? '/1' : ''}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getLista(fltr: any = {}): Observable<NotificacionCliente[]> {
    return this.http.get<NotificacionCliente[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: NotificacionCliente): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/guardar${!!entidad.notificacion_cliente ? ('/' + entidad.notificacion_cliente) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getListaClientes(): Observable<ClienteRT[]> {
    return this.http.get<ClienteRT[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/get_lista_clientes`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  toggleBloqueoCliente(idCliente: number): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/toggle_bloqueo_cliente/${idCliente}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }  

}
