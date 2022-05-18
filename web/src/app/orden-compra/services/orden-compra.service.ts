import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '../../shared/global';
import { ServiceErrorHandler } from '../../shared/error-handler';
import { OrdenCompra } from '../interfaces/orden-compra';
import { DetalleOrdenCompra } from '../interfaces/detalle-orden-compra';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class OrdenCompraService {

  private srvcErrHndl: ServiceErrorHandler;
  private ordenCompraUrl = 'compra';

  constructor(
    private http: HttpClient
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<OrdenCompra[]> {
    return this.http.get<OrdenCompra[]>(
      `${GLOBAL.urlWms}/${this.ordenCompraUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: OrdenCompra) {
    return this.http.post<any>(
      `${GLOBAL.urlWms}/${this.ordenCompraUrl}/guardar${+entidad.orden_compra > 0 ? ('/' + entidad.orden_compra) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getDetalle(idoc: number, fltr: any = {}): Observable<DetalleOrdenCompra[]> {
    return this.http.get<DetalleOrdenCompra[]>(
      `${GLOBAL.urlWms}/${this.ordenCompraUrl}/buscar_detalle/${idoc}?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveDetalle(entidad: DetalleOrdenCompra) {
    return this.http.post<any>(
      `${GLOBAL.urlWms}/${this.ordenCompraUrl}/guardar_detalle/${entidad.orden_compra}${+entidad.orden_compra_detalle > 0 ? ('/' + entidad.orden_compra_detalle) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getArticulosPorProveedor = (fltr: any = {}) => {
    return this.http.get<any[]>(
      `${GLOBAL.urlWms}/${this.ordenCompraUrl}/get_articulos_proveedor?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

}
