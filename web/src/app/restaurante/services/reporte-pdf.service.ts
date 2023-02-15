import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportePdfService {
  private srvcErrHndl: ServiceErrorHandler;
  private usrToken: string = null;
  private httpOptions: Object = { responseType: 'blob' };

  constructor(
    private http: HttpClient,
    private ls: LocalstorageService
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
    this.usrToken = this.ls.get(GLOBAL.usrTokenVar) ? this.ls.get(GLOBAL.usrTokenVar).token : null;

    this.httpOptions['headers'] = new HttpHeaders({
      'Authorization': this.usrToken,
      'Accept': 'application/pdf'
    });
  }

  getReporteCaja(params: Object) {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/reporte/caja`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getReporteCajaTurno(params: Object) {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/reporte/rpt_caja_turno`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getReporteExistencia(params: Object) {

    return this.http.post<string>(
      `${GLOBAL.urlWms}/reporte/existencia`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getReporteValorizado(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlWms}/reporte/valorizado`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  imprimirInventarioFisico(id: number, params?: Object) {
    this.httpOptions['params'] = params;
    return this.http.get<string>(
      `${GLOBAL.urlWms}/fisico/imprimir/${id}`,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  imprimirReceta(id: number, conIva: number = 0) {
    return this.http.get<string>(
      `${GLOBAL.urlMantenimientos}/articulo/imprimir_receta/${id}?_coniva=${conIva}`,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getReporteKardex(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlWms}/reporte/kardex`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getReporteFactura(params: Object) {
    this.httpOptions['params'] = params;

    return this.http.get<string>(
      `${GLOBAL.urlAppRestaurante}/reporte/factura`,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getReportePropina(params: Object) {
    this.httpOptions['params'] = params;

    return this.http.get<string>(
      `${GLOBAL.urlAppRestaurante}/reporte/distribucion_propina`,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getComanda(idcuenta: number) {
    return this.http.get<string>(
      `${GLOBAL.urlAppRestaurante}/comanda/imprimir/${idcuenta}/1`,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getReporteIngreso(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlWms}/rep/ingreso/generar_detalle`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getReporteComandas(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlAppRestaurante}/reporte/rpt_detalle_comanda`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getReporteConsumos(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlWms}/reporte/consumos`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getDumpIngresos(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlWms}/reporte/dump_ingresos`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getDumpEgresos(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlWms}/reporte/dump_egresos`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getIngreso(idIngreso: number) {
    return this.http.get<string>(
      `${GLOBAL.urlWms}/reporte/ingreso/${idIngreso}`,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getEgreso(idEgreso: number) {
    return this.http.get<string>(
      `${GLOBAL.urlWms}/reporte/egreso/${idEgreso}`,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getListaPedidos(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlWms}/reporte/lista_pedidos`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getOrdenCompra(idOC: number, idBodega: number = 0) {
    return this.http.get<string>(
      `${GLOBAL.urlWms}/reporte/orden_compra/${idOC}${+idBodega > 0 ? ('/' + idBodega) : ''}`,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }  

  ventas_admin(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlAppRestaurante}/reporte/ventas_administrativo`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

  generar_archivo_pedidos_proveedor(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlWms}/reporte/lista_ordenes_compra`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  generar_resumen_egreso(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlWms}/reporte/resumen_egreso`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  generar_resumen_ingreso(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlWms}/rep/ingreso/generar_resumen`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  generar_catalogo_articulo(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlWms}/reporte/generar_catalogo_articulo`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  generar_uso_ingrediente(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlWms}/reporte/generar_uso_ingrediente`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  generar_margen_receta(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlWms}/reporte/margen_receta`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  generar_consumo_articulo(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlWms}/reporte/consumo_articulo`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  generar_receta_costo(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlWms}/reporte/generar_receta_costo`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getReporteArticulosEliminados(params: Object) {
    return this.http.post<string>(
      `${GLOBAL.urlAppRestaurante}/reporte/articulos_eliminados`,
      params,
      this.httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
