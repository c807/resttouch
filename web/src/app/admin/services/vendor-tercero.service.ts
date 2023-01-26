import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { VendorTercero, VendorTerceroResponse, SedeVendorTercero } from '@admin-interfaces/vendor-tercero';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class VendorTerceroService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'vendor_tercero';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<VendorTerceroResponse[]> {
    return this.http.get<VendorTerceroResponse[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/buscar?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: VendorTercero): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/guardar${!!entidad.vendor_tercero ? ('/' + entidad.vendor_tercero) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getSedeVendorTercero(fltr: any = {}): Observable<SedeVendorTercero[]> {
    return this.http.get<SedeVendorTercero[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/get_sede_vendor_tercero?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }

  saveSedeVendorTercero(entidad: SedeVendorTercero): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/guardar_sede_vendor_tercero${!!entidad.sede_vendor_tercero ? ('/' + entidad.sede_vendor_tercero) : ''}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

}
