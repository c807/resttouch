import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Reserva } from '@hotel-interfaces/reserva';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

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

  get(fltr: any = {}, simple = false): Observable<any> {
    if(simple) {
      return this.http.get<Reserva[]>(
        `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/simple_search?${qs.stringify(fltr)}`
      ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
    }

    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/buscar`,
      fltr
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: Reserva): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/guardar${!!entidad.reserva ? ('/' + entidad.reserva) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  agregarCobroHabitacion(params: any): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/agregar_cobro_habitacion`,
      params
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

  cambiarHabitacion(params: any): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/cambiar_habitacion`,
      params
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

  getInfoReserva(idReservacion: number): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/info_reserva/${idReservacion}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
