import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { PorCategoria, PorArticulo } from '@restaurante-interfaces/reporte-ventas';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class ReporteVentasService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'reporte/venta'; 

  constructor(
    private http: HttpClient,    
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();    
  }

  porCategoria(params: any): Observable<PorCategoria[]> {
    return this.http.get<PorCategoria[]>(
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/categoria?${qs.stringify(params)}`
      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  porArticulo(params: any): Observable<PorArticulo[]> {
    return this.http.get<PorArticulo[]>(
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/articulo?${qs.stringify(params)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  porCategoriaPdf(params: Object) {
    const httpOptions = {
      headers: new HttpHeaders({        
        Accept: 'application/pdf'
      }),
      responseType: 'blob' as 'json'
    };

    return this.http.post<string>(      
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/categoriapdf`,
      params,
      httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  porCategoriaPorCombo(params: Object) {
    const httpOptions = {
      headers: new HttpHeaders({        
        Accept: 'application/pdf'
      }),
      responseType: 'blob' as 'json'
    };

    return this.http.post<string>(
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/ventas_articulos_categoria`,      
      params,
      httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }  

  porMesero(params: Object) {
    const httpOptions = {
      headers: new HttpHeaders({        
        Accept: 'application/pdf'
      }),
      responseType: 'blob' as 'json'
    };

    return this.http.post<string>(
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/ventas_detallada_mesero`,      
      params,
      httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  porArticuloPdf(params: Object) {
    const httpOptions = {
      headers: new HttpHeaders({        
        Accept: 'application/pdf'
      }),
      responseType: 'blob' as 'json'
    };

    return this.http.post<string>(
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/ventas_articulo`,
      params,
      httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  porArticuloComandado(params: Object) {
    const httpOptions = {
      headers: new HttpHeaders({        
        Accept: 'application/pdf'
      }),
      responseType: 'blob' as 'json'
    };

    return this.http.post<string>(
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/ventas_articulo_comandados`,
      params,
      httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  porVentaHabitacion(params: Object) {
    const httpOptions = {
      headers: new HttpHeaders({        
        Accept: 'application/pdf'
      }),
      responseType: 'blob' as 'json'
    };

    return this.http.post<string>(
      `${GLOBAL.urlFacturacion}/${this.moduleUrl}/ventas_por_habitacion`,
      params,
      httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
  
}
