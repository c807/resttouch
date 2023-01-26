import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { ComandaOrigen } from '@admin-interfaces/comanda-origen';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ComandaOrigenService {

  private srvcErrHndl: ServiceErrorHandler;

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(): Observable<ComandaOrigen[]> {
    return this.http.get<ComandaOrigen[]>(
      `${GLOBAL.urlCatalogos}/get_comanda_origen`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
