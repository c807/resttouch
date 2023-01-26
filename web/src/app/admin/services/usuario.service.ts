import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { ServiceErrorHandler } from '@shared/error-handler';
import { usrLogin, usrLogInResponse, Usuario } from '@admin-models/usuario';
import { AccesoUsuario, SubModulo, NodoAppMenu } from '@admin-interfaces/acceso-usuario';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private srvcErrHndl: ServiceErrorHandler;
  private moduleUrl = 'usuario';
  private usrToken: string = null;
  private readonly jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private ls: LocalstorageService
  ) {
    this.srvcErrHndl = new ServiceErrorHandler();
    this.usrToken = this.ls.get(GLOBAL.usrTokenVar) ? this.ls.get(GLOBAL.usrTokenVar).token : null;
  }

  private setToken() {
    this.usrToken = this.ls.get(GLOBAL.usrTokenVar) ? this.ls.get(GLOBAL.usrTokenVar).token : null;
  }

  login(usr: usrLogin): Observable<usrLogInResponse> {
    const obj = {
      usr: usr.usuario,
      pwd: usr.contrasenia
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<usrLogInResponse>(
      `${GLOBAL.url}/${this.moduleUrl}/login`,
      JSON.stringify(obj),
      httpOptions
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  desbloquear = (pindesbloqueo: number) => {
    return this.http.post<any>(
      `${GLOBAL.url}/${this.moduleUrl}/desbloqueo_usuario`,
      { pindesbloqueo }      
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getAll(debaja: number = 0): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(
      `${GLOBAL.url}/${this.moduleUrl}/obtener_usuarios`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  async checkUserToken(): Promise<boolean> {
    this.setToken();
    return new Promise((resolve, reject) => {
      if (this.usrToken) {
        const decodedToken = this.jwtHelper.decodeToken(this.usrToken);
        // console.log('decodedToken', decodedToken);
        if (moment().isBefore(moment(decodedToken.hasta))) {
          resolve(true);
        }
      }
      resolve(false);
    });    
  }

  get(filtros: any): Observable<Usuario[]> {
    return this.http.post<Usuario[]>(
      `${GLOBAL.url}/${this.moduleUrl}/usuarios_post`,
      filtros
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  getMeserosTurno(): Observable<Usuario[]> {    
    return this.http.get<Usuario[]>(
      `${GLOBAL.urlCatalogos}/get_mesero`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }

  save(entidad: Usuario): Observable<any> {
    if (entidad.usuario) {
      return this.http.post<any>(
        `${GLOBAL.url}/${this.moduleUrl}/guardar_usuario/${entidad.usuario}`,
        entidad        
      ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
    } else {
      if (!entidad.contrasenia) {
        delete entidad.contrasenia;
      }
      return this.http.post<any>(
        `${GLOBAL.url}/${this.moduleUrl}/guardar_usuario`,
        entidad        
      ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
    }

  }  

  getAppMenu = (): AccesoUsuario[] => this.ls.get(GLOBAL.usrTokenVar).acceso || [];

  transformSubModule = (subModulos: SubModulo[]): NodoAppMenu[] => {
    const objMenu: NodoAppMenu[] = [];
    subModulos.forEach(sm => objMenu.push({ nombre: sm.nombre, link: null, hijos: sm.opciones }));
    return objMenu;
  }

  getRolesTurno(idUsuario: number): Observable<any> {
    return this.http.get<any>(
      `${GLOBAL.url}/${this.moduleUrl}/get_rol_turno/${idUsuario}`
    ).pipe(retry(GLOBAL.reintentos), catchError(this.srvcErrHndl.errorHandler));
  }
}
