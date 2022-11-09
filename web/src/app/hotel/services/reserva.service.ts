import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '../../shared/global';
import { ServiceErrorHandler } from '../../shared/error-handler';
import { Reserva } from '../interfaces/reserva';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'reserva';

  constructor(
    private http: HttpClient
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/buscar`,
      fltr
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  // save(entidad: Reserva): Observable<any> {
  //   return this.http.post<any>(
  //     `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/guardar${!!entidad.tarifa_reserva ? ('/' + entidad.tarifa_reserva) : ''}`,
  //     entidad
  //   ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  // }
}
