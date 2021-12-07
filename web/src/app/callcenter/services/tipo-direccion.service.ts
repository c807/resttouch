import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '../../shared/global';
import { ServiceErrorHandler } from '../../shared/error-handler';
import { TipoDireccion } from '../interfaces/tipo-direccion';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class TipoDireccionService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'tipo_direccion';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<TipoDireccion[]> {
    return this.http.get<TipoDireccion[]>(
      `${GLOBAL.urlCallCenter}/${this.moduleUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: TipoDireccion): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlCallCenter}/${this.moduleUrl}/guardar${!!entidad.tipo_direccion ? ('/' + entidad.tipo_direccion) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

}
