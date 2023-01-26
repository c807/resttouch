import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Certificador, Configuracion } from '@admin-interfaces/certificador';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class CertificadorService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'certificador';  

  constructor(
    private http: HttpClient    
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  getConfig(fltr: any = {}): Observable<Configuracion[]> {    
    return this.http.get<Configuracion[]>(`${GLOBAL.urlMantenimientos}/${this.moduleUrl}/get_configuracion?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getCertificador(fltr: any = {}): Observable<Certificador[]> {    
    return this.http.get<Certificador[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/get_certificador?${qs.stringify(fltr)}`      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  saveConfig(entidad: Configuracion): Observable<any> {    
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/guardar_configuracion${!!entidad.certificador_configuracion ? ('/' + entidad.certificador_configuracion) : ''}`,
      entidad      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: Certificador): Observable<any> {    
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/guardar_certificador/${entidad.certificador_configuracion}${!!entidad.certificador_fel ? ('/' + entidad.certificador_fel) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
