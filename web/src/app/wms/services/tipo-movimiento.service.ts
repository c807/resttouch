import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { TipoMovimiento } from '@wms-interfaces/tipo-movimiento';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class TipoMovimientoService {

  private srvcErrHndl: ServiceErrorHandler;  

  constructor(
    private http: HttpClient    
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();    
  }

  get(fltr: any = {}): Observable<TipoMovimiento[]> {
    return this.http.get<TipoMovimiento[]>(
      `${GLOBAL.urlCatalogos}/get_tipo_movimiento?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: TipoMovimiento): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/tipo_movimiento/guardar${!!entidad.tipo_movimiento ? ('/' + entidad.tipo_movimiento) : ''}`,
      entidad      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
