import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '../../shared/global';
import { ServiceErrorHandler } from '../../shared/error-handler';
import { Comanda, ComandaGetResponse } from '../interfaces/comanda';
import { Cuenta } from '../interfaces/cuenta';
import { DetalleComanda } from '../interfaces/detalle-comanda';
import { DetalleCuentaResponse } from '../interfaces/cuenta';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class ComandaService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'comanda';
  private ctaModuleUrl = 'cuenta';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<Comanda[]> {
    return this.http.get<Comanda[]>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getComandaDeMesa(idmesa: number, conDetalle = true): Observable<ComandaGetResponse> {
    return this.http.get<ComandaGetResponse>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/get_comanda/${idmesa}${conDetalle ? '' : '?_sin_detalle=1'}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: Comanda) {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/guardar${entidad.comanda ? ('/' + entidad.comanda) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  enviarPedido(idcomanda: number, pedido: any) {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/callcenter/guardar_pedido/${idcomanda}`,
      pedido
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveDetalleCombo(idcomanda: number, idcuenta: number, detalle: DetalleComanda) {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/guardar_detalle_combo/${idcomanda}/${idcuenta}`,
      detalle
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveNotasGenerales(entidad: any) {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/guardar_notas_generales/${entidad.comanda}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveNotasProducto(entidad: any) {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/guardar_notas_producto/${entidad.detalle_comanda}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveDetalle(idcomanda: number, idcuenta: number, detalle: DetalleComanda) {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/guardar_detalle/${idcomanda}/${idcuenta}`,
      detalle
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  setProductoImpreso(idcuenta: number = 0) {
    return this.http.get<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/imprimir/${idcuenta}/0/1`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  cerrarMesa(idMesa: number): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/cerrar_mesa/${idMesa}`,
      null
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getComandasOnLIne(): Observable<ComandaGetResponse[]> {
    return this.http.get<ComandaGetResponse[]>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/get_comanda`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  validaPwdGerenteTurno(pwd: string): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/validapwdgerenteturno`,
      { pwd }
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  cerrarEstacion(idcomanda: number): Observable<any> {
    return this.http.get<ComandaGetResponse[]>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/cerrar_estacion/${idcomanda}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getCuenta(idcuenta: number, fltr: any = {}): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlAppRestaurante}/${this.ctaModuleUrl}/get_cuenta/${idcuenta}?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  nueva_cuenta(cta: Cuenta): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.ctaModuleUrl}/crear_nueva`,
      cta
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  unificarCuentas(deCuenta: number, aCuenta: number): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/unir_cuentas/${deCuenta}/${aCuenta}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  trasladarMesa(idComanda: number, idMesaOrigen: number, idMesaDestino: number): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/trasladar_mesa/${idComanda}/${idMesaOrigen}/${idMesaDestino}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getComandasCocina(fltr: any = {}): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/get_comanda_cocina?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  setComandaCocinada(idcomanda: number, datos: any): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/set_cocinado/${idcomanda}`,
      datos
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  distribuirCuentas(datos: any): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/distribuir_cuentas`,
      datos
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  cancelarPedido(idComanda: number, datos: any): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/anular_pedido/${idComanda}`,
      datos
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  listaComandas(fltr: any = {}): Observable<any[]> {
    return this.http.get<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/lista_comandas?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  anularComanda(params: any): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/anular_comanda/${params.comanda}`,
      params
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getDetalleCuenta(idcuenta: number, fltr = {}): Observable<DetalleCuentaResponse[]> {
    return this.http.get<DetalleCuentaResponse[]>(
      `${GLOBAL.urlAppRestaurante}/${this.ctaModuleUrl}/get_detalle_cuenta/${idcuenta}?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

}
