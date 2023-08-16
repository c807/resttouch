import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

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
      `${GLOBAL.urlWms}/bodegaarticulocosto/cargar_articulos_excel`,
      obj
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }
}
