import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Proveedor } from '@wms-interfaces/proveedor';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  private srvcErrHndl: ServiceErrorHandler;

  constructor(
    private http: HttpClient
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<Proveedor[]> {    
    return this.http.get<Proveedor[]>(
      `${GLOBAL.urlCatalogos}/get_proveedor?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: Proveedor): Observable<any> {    
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/proveedor/guardar${!!entidad.proveedor ? ('/' + entidad.proveedor) : ''}`,
      entidad      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
