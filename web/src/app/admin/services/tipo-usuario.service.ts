import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { UsuarioTipo } from '@admin-interfaces/usuario-tipo';
import { UsuarioTipoCategoriaGrupo, UsuarioTipoCGrupo } from '@admin-interfaces/usuario-tipo-categoria-grupo';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})

export class TipoUsuarioService {
  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'tipo_usuario';
  constructor(
    private http: HttpClient,    
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();    
  }

  get(fltr: any = {}): Observable<UsuarioTipo[]> {   
    return this.http.get<UsuarioTipo[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/buscar?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: UsuarioTipo): Observable<any> {   
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/guardar${!!entidad.usuario_tipo ? ('/' + entidad.usuario_tipo) : ''}`,
      entidad      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getUsuarioTipoCGrupo(fltr: any = {}): Observable<UsuarioTipoCGrupo[]> {
    return this.http.get<UsuarioTipoCGrupo[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/buscar_cgrupo?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveUsuarioTipoCGrupo(entidad: UsuarioTipoCategoriaGrupo): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/guardar_cgrupo${!!entidad.usuario_tipo_categoria_grupo ? ('/' + entidad.usuario_tipo_categoria_grupo) : ''}`,
      entidad      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
