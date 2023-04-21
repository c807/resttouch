import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'chat';

  constructor(
    private http: HttpClient,
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
  }

  queryChefbot(prompt: string): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.url}/${this.moduleUrl}/query_chefbot`,
      { prompt: prompt }
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  askRtChefbot(prompt: string): Observable<any> {
    return this.http.post<any>(
      `${GLOBAL.urlRtChefBot}`,
      { prompt: prompt }
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));    
  }
}
