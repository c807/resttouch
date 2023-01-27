import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { FacturaSerie } from '@pos-interfaces/factura-serie';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class FacturaSerieService {

  private srvcErrHndl: ServiceErrorHandler;

  constructor(
    private http: HttpClient
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<FacturaSerie[]> {    
    return this.http.get<FacturaSerie[]>(
      `${GLOBAL.urlCatalogos}/get_factura_serie?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
