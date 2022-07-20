import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '../../shared/global';
import { ServiceErrorHandler } from '../../shared/error-handler';
import { Esquemas, InitialSetup } from '../interfaces/setup';
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
}
