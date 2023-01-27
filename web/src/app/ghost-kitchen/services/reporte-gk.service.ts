import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReporteGkService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'reporte_gk';
  private usrToken: string = null;
  private httpOptions: Object = { responseType:'blob' };

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

  propinas(params: any): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlGhostKitchen}/${this.moduleUrl}/propinas`, params, this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  generaVentaMarca(params: any): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlGhostKitchen}/${this.moduleUrl}/venta_marca`, params, this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
