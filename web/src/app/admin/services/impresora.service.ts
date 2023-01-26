import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Impresora } from '@admin-interfaces/impresora';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class ImpresoraService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'impresora';  

  constructor(
    private http: HttpClient,    
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();    
  }

  get(fltr: any = {}): Observable<Impresora[]> {   
    return this.http.get<Impresora[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/buscar?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: Impresora): Observable<any> {   
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/guardar${!!entidad.impresora ? ('/' + entidad.impresora) : ''}`,
      entidad      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
