import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { GLOBAL } from '../../shared/global';
import { ServiceErrorHandler } from '../../shared/error-handler';
import { Repartidor } from '../interfaces/repartidor';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class RtpPedidosService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'rpt_pedidos_sede';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  pedidosRTP(fltr: any = {}) {

    const httpOptions = {
      headers: new HttpHeaders({
        Accept: 'application/pdf'
      }),
      responseType: 'blob' as 'json'
    };

    return this.http.post<string>(
      `${GLOBAL.urlCallCenter}/${this.moduleUrl}/getpedidosrpt?${qs.stringify(fltr)}`,
      fltr,
      httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));


   }

}
