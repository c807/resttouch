import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { FormaPago } from '@pos-interfaces/forma-pago';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class FormaPagoService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'catalogo';
  private manteUrl = 'fpago'; 

  constructor(
    private http: HttpClient,
    
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
    
  }

  get(fltr: any = {}): Observable<FormaPago[]> {   
    return this.http.get<FormaPago[]>(
      `${GLOBAL.url}/${this.moduleUrl}/get_forma_pago?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  buscar(fltr: any = {}): Observable<FormaPago[]> {   
    return this.http.get<FormaPago[]>(
      `${GLOBAL.urlMantenimientos}/${this.manteUrl}/buscar?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: FormaPago): Observable<any> {   
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.manteUrl}/guardar${!!entidad.forma_pago ? ('/' + entidad.forma_pago) : ''}`, entidad      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

}
