import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '../../shared/global';
import { ServiceErrorHandler } from '../../shared/error-handler';
import { FacturaRequest, Factura } from '../interfaces/factura';
import { DetalleFactura } from '../interfaces/detalle-factura';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'factura';

  constructor(
    private http: HttpClient
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  facturar(entidad: FacturaRequest): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/guardar`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  get(fltr: any = {}): Observable<Factura[]> {
    return this.http.get<Factura[]>(
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/buscar_factura?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  imprimir(idfactura: number): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/imprimir/${idfactura}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: Factura): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/guardar${!!entidad.factura ? ('/' + entidad.factura) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  refacturar(entidad: Factura): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/refacturar${!!entidad.factura ? ('/' + entidad.factura) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  firmar(identidad: number): Observable<any> {
    return this.http.post<any>(`${GLOBAL.urlFacturacion}/${this.moduleUrl}/facturar/${identidad}`, {}
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  anular(identidad: number, params: any = {}): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/anular/${identidad}`,
      params
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getDetalle(idfactura: number, fltr: any = {}): Observable<DetalleFactura[]> {
    return this.http.get<DetalleFactura[]>(
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/buscar_detalle/${idfactura}?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveDetalle(entidad: DetalleFactura): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/guardar_detalle/${entidad.factura}${!!entidad.detalle_factura ? ('/' + entidad.detalle_factura) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getGrafo(idfactura: number): Observable<any> {
    return this.http.get<DetalleFactura[]>(
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/get_grafo_factura/${idfactura}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getListaFactura(params:any={}): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/buscar`,
      params
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  enviarFacturaConta(params:any={}): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/migrar_factura`,
      params
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getFacturaFel(xid: number): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/get_resultado_factura/${xid}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
