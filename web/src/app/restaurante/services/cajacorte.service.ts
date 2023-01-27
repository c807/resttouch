import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { ccGeneral, ccDetalle, ccTipo, ccNominacion } from '@restaurante-interfaces/cajacorte';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class CajacorteService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'cajacorte';  

  constructor(
    private http: HttpClient
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();    
  }

  buscar(fltr: any = {}): Observable<ccGeneral[]> {   
    return this.http.get<ccGeneral[]>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/buscar?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getCajaCorteTipo(fltr: any = {}): Observable<ccTipo[]> {   
    return this.http.get<ccTipo[]>(
      `${GLOBAL.urlCatalogos}/get_caja_corte_tipo?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getCajaCorteNominacion(fltr: any = {}): Observable<ccNominacion[]> {   
    return this.http.get<ccNominacion[]>(
      `${GLOBAL.urlCatalogos}/get_caja_corte_nominacion?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  guardar(entidad: any): Observable<any> {   
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/guardar`,
      entidad      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  anularCorte(entidad: ccGeneral): Observable<any> {   
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/anular_caja`,
      entidad      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  anularDetalle(entidad: ccDetalle): Observable<any> {   
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/anular_caja_detalle`,
      entidad      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getDetalleCaja(idCaja: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/get_detalle_caja/${idCaja}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}