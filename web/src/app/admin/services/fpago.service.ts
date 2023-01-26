import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { FormaPago, FormaPagoComandaOrigen, FormaPagoComandaOrigenResponse } from '@admin-interfaces/forma-pago';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class FpagoService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'fpago';  

  constructor(
    private http: HttpClient    
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();    
  }

  get(fltr: any = {}): Observable<FormaPago[]> {   
    return this.http.get<FormaPago[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/buscar?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(forma: FormaPago): Observable<any> {   
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/guardar${!!forma.forma_pago ? ('/' + forma.forma_pago) : ''}`,
      forma      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getFormaPagoComandaOrigen(fltr: any = {}): Observable<FormaPagoComandaOrigenResponse[]> {
    return this.http.get<FormaPagoComandaOrigenResponse[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/get_formas_pago_comanda_origen?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveFormaPagoComandaOrigen(fpco: FormaPagoComandaOrigen): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/guardar_fpco${!!fpco.forma_pago_comanda_origen ? ('/' + fpco.forma_pago_comanda_origen) : ''}`,
      fpco      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

}
