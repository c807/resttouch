import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Acceso, UsuarioSede } from '@admin-interfaces/acceso';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class AccesoUsuarioService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'acceso';

  constructor(
    private http: HttpClient,    
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();    
  }

  get(fltr: any = {}): Observable<Acceso[]> {   
    return this.http.get<Acceso[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/buscar?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: Acceso): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/guardar${!!entidad.acceso ? ('/' + entidad.acceso) : ''}`,
      entidad      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getSedes(fltr: any = {}): Observable<UsuarioSede[]> {   
    return this.http.get<UsuarioSede[]>(
      `${GLOBAL.urlMantenimientos}/sede/get_sede_usuario?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveSedes(entidad: UsuarioSede): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/sede/set_usuario_sede${!!entidad.usuario_sede ? ('/' + entidad.usuario_sede) : ''}`,
      entidad      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
