import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class SubModuloService {

  private srvcErrHndl: ServiceErrorHandler;

  constructor(
    private http: HttpClient
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(idmodulo: number, fltr: any = {}): Observable<any[]> {    
    return this.http.get<any[]>(
      `${GLOBAL.urlCatalogos}/get_sub_modulo/${idmodulo}/?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
