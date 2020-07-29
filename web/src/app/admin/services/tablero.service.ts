import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../shared/global';
import { ServiceErrorHandler } from '../../shared/error-handler';
import { LocalstorageService } from '../../admin/services/localstorage.service';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class TableroService {
  private srvcErrHndl: ServiceErrorHandler;
  private usrToken: string = null;
  private httpOptions: Object = {responseType:'json'};

  constructor(
    private http: HttpClient,
    private ls: LocalstorageService
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
    this.usrToken = this.ls.get(GLOBAL.usrTokenVar) ? this.ls.get(GLOBAL.usrTokenVar).token : null;

    this.httpOptions['headers'] = new HttpHeaders({
      'Authorization': this.usrToken,
      'Accept': 'application/pdf'
    });
  }

  getTableroDatos(params: Object) {
    this.httpOptions['params'] = params;

    return this.http.get<any>(
      `${GLOBAL.url}/tablero/get_datos`,
      this.httpOptions
    ).pipe(
      retry(1), 
      catchError(this.srvcErrHndl.errorHandler)
    );
  }
}