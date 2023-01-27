import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { TipoTurno } from '@restaurante-interfaces/tipo-turno';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class TipoTurnoService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'turno';  

  constructor(
    private http: HttpClient,    
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();    
  }

  get(fltr: any = {}): Observable<TipoTurno[]> {   
    return this.http.get<TipoTurno[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/get_turno_tipo?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: TipoTurno) {   
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/guardar_turno_tipo${entidad.turno_tipo ? ('/' + entidad.turno_tipo) : ''}`,
      entidad      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
