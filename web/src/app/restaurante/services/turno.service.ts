import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Turno } from '@restaurante-interfaces/turno';
import { DetalleTurno } from '@restaurante-interfaces/detalle-turno';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'turno';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<Turno[]> {
    return this.http.get<Turno[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: Turno) {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/guardar${entidad.turno ? ('/' + entidad.turno) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getDetalle(idturno: number, fltr: any = {}): Observable<DetalleTurno[]> {
    return this.http.get<DetalleTurno[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/buscar_usuario/${idturno}?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveDetalle(entidad: DetalleTurno) {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/agregar_usuario/${entidad.turno}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  anularDetalle(entidad: DetalleTurno) {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/anular_usuario/${entidad.turno}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  replicaDetalleTurno(idTurnoOriginal: number, idTurnoCopia: number): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/replica_detalle_turno/${idTurnoOriginal}/${idTurnoCopia}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
