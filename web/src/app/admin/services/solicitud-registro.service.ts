import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '../../shared/global';
import { ServiceErrorHandler } from '../../shared/error-handler';
import { SolicitudRegistro } from '../interfaces/solicitud-registro';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
// import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudRegistroService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'solicitud_registro';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  save(obj: SolicitudRegistro): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.url}/${this.moduleUrl}/guardar${!!obj.solicitud_registro ? ('/' + obj.solicitud_registro) : ''}`,
      obj
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

}
