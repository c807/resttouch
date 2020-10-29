import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../shared/global';
import { ServiceErrorHandler } from '../../shared/error-handler';
import { LocalstorageService } from '../../admin/services/localstorage.service';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportePdfService {
  private srvcErrHndl: ServiceErrorHandler;
  private usrToken: string = null;
  private httpOptions: Object = {responseType:'blob'};

  constructor(
    private http: HttpClient,
    private ls: LocalstorageService
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
    this.usrToken = this.ls.get(GLOBAL.usrTokenVar) ? this.ls.get(GLOBAL.usrTokenVar).token : null;

    this.httpOptions['headers'] = new HttpHeaders({
      'Authorization': this.usrToken,
      'Accept': 'application/pdf'
    });
  }

  getReporteCaja(params: Object) {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/reporte/caja`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getReporteExistencia(params: Object) {
    this.httpOptions['params'] = params;

    return this.http.get<string>(
        `${GLOBAL.urlWms}/reporte/existencia`,
        this.httpOptions
        ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getReporteKardex(params: Object) {
    this.httpOptions['params'] = params;

    return this.http.get<string>(
        `${GLOBAL.urlWms}/reporte/kardex`,
        this.httpOptions
        ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getReporteFactura(params: Object) {
    this.httpOptions['params'] = params;

    return this.http.get<string>(
      `${GLOBAL.urlAppRestaurante}/reporte/factura`,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getReportePropina(params: Object) {
    this.httpOptions['params'] = params;

    return this.http.get<string>(
      `${GLOBAL.urlAppRestaurante}/reporte/distribucion_propina`,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getComanda(idcuenta: number) {
    return this.http.get<string>(
        `${GLOBAL.urlAppRestaurante}/comanda/imprimir/${idcuenta}/1`,
        this.httpOptions
        ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
