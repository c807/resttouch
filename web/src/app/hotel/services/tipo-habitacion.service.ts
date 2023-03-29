import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { TipoHabitacion } from '@hotel-interfaces/tipo-habitacion';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class TipoHabitacionService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'tipo_habitacion';

  constructor(
    private http: HttpClient
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<TipoHabitacion[]> {
    return this.http.get<TipoHabitacion[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: TipoHabitacion): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/guardar${!!entidad.tipo_habitacion ? ('/' + entidad.tipo_habitacion) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
