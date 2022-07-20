import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '../../shared/global';
import { ServiceErrorHandler } from '../../shared/error-handler';
import { Esquemas, InitialSetup, EsquemasClientes } from '../interfaces/setup';
import { Configuracion } from '../interfaces/configuracion';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class SetupService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'schema';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get_esquemas(fltr: any = {}): Observable<Esquemas[]> {
    return this.http.get<Esquemas[]>(
      `${GLOBAL.url}/${this.moduleUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  get_esquemas_clientes(fltr: any = {}): Observable<EsquemasClientes[]> {
    return this.http.get<EsquemasClientes[]>(
      `${GLOBAL.url}/${this.moduleUrl}/buscar_esquemas_clientes?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  nuevo_esquema(entidad: InitialSetup): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.url}/${this.moduleUrl}/nuevo`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  actualizar_esquema(sql: string): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.url}/${this.moduleUrl}/actualizar`,
      { sql: sql }
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  get_configuracion_corporacion(fltr: any = {}): Observable<Configuracion[]> {
    return this.http.get<Configuracion[]>(
      `${GLOBAL.url}/${this.moduleUrl}/buscar_configuracion_corporacion?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  guardar_configuracion_corporacion(obj: any): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.url}/${this.moduleUrl}/guardar_configuracion_corporacion`,
      obj
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

}
