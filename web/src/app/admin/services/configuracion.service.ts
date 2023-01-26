import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { Configuracion } from '@admin-interfaces/configuracion';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {  

  private moduleUrl = 'configuracion'; 

  constructor(
    private http: HttpClient,
    private ls: LocalstorageService
  ) { }

  load = () => {
    const promise = new Promise<void>((resolve, reject) => {
      this.http.get<Configuracion[]>(
        `${GLOBAL.urlMantenimientos}/${this.moduleUrl}/buscar`
        
      ).toPromise().then((cnf: Configuracion[]) => {
        const tmp = this.ls.get(GLOBAL.usrTokenVar);
        tmp.configuracion = cnf;
        this.ls.set(GLOBAL.usrTokenVar, tmp);
        resolve();
      }, err => reject(err));
    });
    return promise;
  }

  getConfig = (configName: string): (number | string | boolean) => {
    const configuraciones: Configuracion[] = this.ls.get(GLOBAL.usrTokenVar) ? this.ls.get(GLOBAL.usrTokenVar).configuracion : [];
    let valor: (number | string | boolean) = null;
    for (const cnf of configuraciones) {
      if (cnf.campo === configName) {
        switch (+cnf.tipo) {
          case 1: valor = +cnf.valor; break;
          case 2: valor = cnf.valor; break;
          case 3: valor = (+cnf.valor === 1); break;
        }
        break;
      }
    }
    return valor;
  }
}
