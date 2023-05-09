import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Rol, RolAcceso } from '@admin-interfaces/rol';
import { ModuloRol } from '@admin-interfaces/menu';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'rol';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<Rol[]> {
    return this.http.get<Rol[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: Rol): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/guardar${!!entidad.rol ? ('/' + entidad.rol) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getDetalleRol(idRol: number): Observable<ModuloRol[]> {
    return this.http.get<ModuloRol[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/buscar_detalle/${idRol}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveDetalleRol(entidad: RolAcceso): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/guardar_detalle`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
