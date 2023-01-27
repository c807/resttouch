import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Cobro } from '@pos-interfaces/cobro';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CobroService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'cuenta';

  constructor(
    private http: HttpClient
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  save(entidad: Cobro): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlAppRestaurante}/${this.moduleUrl}/cobrar/${entidad.cuenta}`,
      entidad
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
