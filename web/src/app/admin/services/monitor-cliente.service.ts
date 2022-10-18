import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ServiceErrorHandler } from '../../shared/error-handler';
import { GLOBAL } from '../../shared/global';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class MonitorClienteService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'monitor_cliente';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  getUltimosMovimientos(): Observable<any> {
    return this.http.get<any>(`${GLOBAL.url}/${this.moduleUrl}/ultimos_movimientos`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getFacturacion(params: any = {}): Observable<any> {
    return this.http.get<any>(`${GLOBAL.url}/${this.moduleUrl}/facturacion?${qs.stringify(params)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getVentasSinFactura(params: any = {}): Observable<any> {
    return this.http.get<any>(`${GLOBAL.url}/${this.moduleUrl}/ventas_sin_factura?${qs.stringify(params)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
