import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '../../shared/global';
import { ServiceErrorHandler } from '../../shared/error-handler';
import { usrLogin, usrLogInResponse, Usuario } from '../models/usuario';
import { LocalstorageService } from '../services/localstorage.service';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl: string = 'usuario';
  private usrToken: string = null;

  constructor(
    private http: HttpClient,
    private ls: LocalstorageService
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
    this.usrToken = this.ls.get(GLOBAL.usrTokenVar) ? this.ls.get(GLOBAL.usrTokenVar).token : null;
  }

  login(usr: usrLogin): Observable<usrLogInResponse> {
    const obj = {
      usr: usr.usuario,
      pwd: usr.contrasenia
    };

    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<usrLogInResponse>(`${GLOBAL.url}/${this.moduleUrl}/login.json`, JSON.stringify(obj), httpOptions).pipe(retry(1), catchError(this.srvcErrHndl.errorHandler));
  }

  getAll(debaja: number = 0): Observable<Usuario[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': this.usrToken
      })
    };
    return this.http.get<Usuario[]>(`${GLOBAL.url}/${this.moduleUrl}/usuarios.json?debaja=${debaja}`, httpOptions).pipe(retry(1), catchError(this.srvcErrHndl.errorHandler));
  }

  async checkUserToken() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': this.usrToken
      })
    };
    const resp: any = await this.http.get(`${GLOBAL.url}/${this.moduleUrl}/checktoken.json`, httpOptions).toPromise();
    if (resp.valido) {
      return resp.valido;
    } else {
      return false;
    }
  }

  get(filtros: any): Observable<Usuario[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': this.usrToken
      })
    };
    return this.http.post<Usuario[]>(`${GLOBAL.url}/${this.moduleUrl}/usuarios.json`, filtros, httpOptions).pipe(retry(1), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: Usuario): Observable<Usuario> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': this.usrToken
      })
    };

    if (entidad.usuario) {
      return this.http.put<Usuario>(`${GLOBAL.url}/${this.moduleUrl}/usuario.json?usuario=${entidad.usuario}`, entidad, httpOptions).pipe(retry(1), catchError(this.srvcErrHndl.errorHandler));
    } else {
      if (!entidad.contrasenia) {
        delete entidad.contrasenia;
      }
      return this.http.post<Usuario>(`${GLOBAL.url}/${this.moduleUrl}/usuario.json`, entidad, httpOptions).pipe(retry(1), catchError(this.srvcErrHndl.errorHandler));
    }

  }
}
