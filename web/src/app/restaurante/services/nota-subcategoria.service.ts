import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { NotaSubCategoria, NotaSubCategoriaReq } from '@restaurante-interfaces/nota-subcategoria';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import * as qs from 'qs';

@Injectable({
  providedIn: 'root'
})
export class NotaSubCategoriaService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'nota_predefinida';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(fltr: any = {}): Observable<NotaSubCategoria[]> {
    return this.http.get<NotaSubCategoria[]>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/get_categorias?${qs.stringify(fltr)}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(datos: NotaSubCategoriaReq) {
    return this.http.post<any>(
      `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/set_categorias`,
      datos
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
