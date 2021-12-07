import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '../../shared/global';
import { ServiceErrorHandler } from '../../shared/error-handler';
import { ClienteMaster, ClienteMasterTelefono, ClienteMasterDireccion, ClienteMasterDireccionResponse } from '../interfaces/cliente-master';
import { Telefono } from '../interfaces/telefono';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class ClienteMasterService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'cliente_master';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<ClienteMaster[]> {
    return this.http.get<ClienteMaster[]>(
      `${GLOBAL.urlCallCenter}/${this.moduleUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: ClienteMaster): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlCallCenter}/${this.moduleUrl}/guardar${!!entidad.cliente_master ? ('/' + entidad.cliente_master) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  buscarTelefono(fltr: any = {}): Observable<Telefono[]> {
    return this.http.get<Telefono[]>(
      `${GLOBAL.urlCallCenter}/${this.moduleUrl}/buscar_telefono?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

  getTelefonosClienteMaster(fltr: any = {}): Observable<ClienteMasterTelefono[]> {
    return this.http.get<ClienteMasterTelefono[]>(
      `${GLOBAL.urlCallCenter}/${this.moduleUrl}/buscar_telefono_cliente_master?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

  saveTelefonosClienteMaster(entidad: any): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlCallCenter}/${this.moduleUrl}/guardar_telefono`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));        
  }

  desasociarTelefonoClienteMaster(idClienteMasterTelefono: number): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlCallCenter}/${this.moduleUrl}/desasociar_telefono_cliente_master/${idClienteMasterTelefono}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));        
  }

  buscarDireccion(fltr: any = {}): Observable<ClienteMasterDireccionResponse[]> {
    return this.http.get<ClienteMasterDireccionResponse[]>(
      `${GLOBAL.urlCallCenter}/${this.moduleUrl}/buscar_direccion?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  guardarDireccion(entidad: ClienteMasterDireccion): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlCallCenter}/${this.moduleUrl}/guardar_direccion${!!entidad.cliente_master_direccion ? ('/' + entidad.cliente_master_direccion) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

}
