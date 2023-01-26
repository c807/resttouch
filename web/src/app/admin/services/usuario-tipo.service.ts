import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { UsuarioTipo } from '@admin-interfaces/usuario-tipo';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioTipoService {

  private srvcErrHndl: ServiceErrorHandler;

  constructor(
    private http: HttpClient
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<UsuarioTipo[]> {    
    return this.http.get<UsuarioTipo[]>(
      `${GLOBAL.urlCatalogos}/get_tipo_usuario?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  /*
  save(entidad: UsuarioTipo) {    
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/guardar_turno_tipo${entidad.turno_tipo ? ('/' + entidad.turno_tipo) : ''}`,
      entidad      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
  */
}
