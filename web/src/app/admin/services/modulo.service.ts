import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Modulo } from '@admin-interfaces/modulo';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class ModuloService {

  private srvcErrHndl: ServiceErrorHandler;  

  constructor(
    private http: HttpClient,    
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();    
  }

  get(fltr: any = {}): Observable<Modulo[]> {   
    return this.http.get<Modulo[]>(
      `${GLOBAL.urlCatalogos}/get_modulo?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
