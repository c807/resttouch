import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
// import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class RecurrenteService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'recurrente';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  crearCliente(entidad: { idcliente: number, email: string, full_name: string }): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.url}/${this.moduleUrl}/crear_cliente`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  generarCobro(entidad: { id_recurrente: string, nombre_producto_recurrente: string, monto: number, idcliente: number }): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.url}/${this.moduleUrl}/generar_cobro`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
