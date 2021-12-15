import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '../../shared/global';
import { ServiceErrorHandler } from '../../shared/error-handler';
import { Telefono } from '../interfaces/telefono';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';


@Injectable({
  providedIn: 'root'
})
export class TelefonoService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'telefono';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<Telefono[]> {
    return this.http.get<Telefono[]>(
      `${GLOBAL.urlCallCenter}/${this.moduleUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: Telefono): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlCallCenter}/${this.moduleUrl}/guardar${!!entidad.telefono ? ('/' + entidad.telefono) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }  
}
