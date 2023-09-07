import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { CargaRealizada_BodegaArticuloCosto, DetalleCargaRealizada_BodegaArticuloCosto } from '@wms-interfaces/bodega';
// import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class AjusteCostoExistenciaService {

  private srvcErrHndl: ServiceErrorHandler;  

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  subir_plantilla_ajuste_costo_existencia(obj: FormData): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlWms}/bodega_articulo_costo/cargar_articulos_excel`,
      obj
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

  getCargasRealizadas(): Observable<CargaRealizada_BodegaArticuloCosto[]> {
    return this.http.get<CargaRealizada_BodegaArticuloCosto[]>(
      `${GLOBAL.urlWms}/bodega_articulo_costo/get_cargas_realizadas`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

  getDetalleCargaRealizada(fecha: string): Observable<DetalleCargaRealizada_BodegaArticuloCosto[]> {
    return this.http.get<DetalleCargaRealizada_BodegaArticuloCosto[]>(
      `${GLOBAL.urlWms}/bodega_articulo_costo/get_detalle_carga_realizada?fecha=${fecha}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }
  
}
