import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { NotificacionCliente } from '@admin-interfaces/notificacion-cliente';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificacionClienteService {

  private srvcErrHndl: ServiceErrorHandler;

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  get(): Observable<NotificacionCliente[]> {
    return this.http.get<NotificacionCliente[]>(
      `${GLOBAL.urlCatalogos}/get_notificaciones_cliente`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

}
