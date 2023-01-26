import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfiguracionService } from '@admin-services/configuracion.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as moment from 'moment';

import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL } from '@shared/global';

@Component({
  selector: 'app-acerca-de',
  templateUrl: './acerca-de.component.html',
  styleUrls: ['./acerca-de.component.css']
})
export class AcercaDeComponent implements OnInit {

  public sedeUuid: string = null;
  public rtVersion: string = GLOBAL.rtVersion;
  public dominio: string = null;
  public restaurante: string = null;
  public cnfRoute: string = null;
  public horasValidezToken: string = null;
  public tiempoTranscurrido: string = 'No ha iniciado sesión.';

  private usrToken: string = null;
  private readonly jwtHelper = new JwtHelperService();

  constructor(
    public dialogRef: MatDialogRef<AcercaDeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ls: LocalstorageService,
    private configSrvc: ConfiguracionService
  ) { }

  ngOnInit() {    
    this.usrToken = this.ls.get(GLOBAL.usrTokenVar) ? this.ls.get(GLOBAL.usrTokenVar).token : null;
    this.sedeUuid = this.ls.get(GLOBAL.usrTokenVar).sede_uuid || 'No ha iniciado sesión.';
    this.dominio = this.ls.get(GLOBAL.usrTokenVar).dominio || 'No ha iniciado sesión.';
    const nombreRestaurante = `${this.ls.get(GLOBAL.usrTokenVar).restaurante?.nombre || ''} (${this.ls.get(GLOBAL.usrTokenVar).restaurante?.alias || ''})`;
    this.restaurante = nombreRestaurante || 'No ha iniciado sesión.';
    this.cnfRoute = this.ls.get(GLOBAL.usrTokenVar).cnf || 'No ha iniciado sesión.';
    const hrValidezToken: number = (this.configSrvc.getConfig(GLOBAL.CONSTANTES.RT_HORAS_VALIDEZ_TOKEN) as number) || null;
    let ese = +hrValidezToken > 1 ? 's' : '';
    this.horasValidezToken = hrValidezToken ? `${hrValidezToken} hora${ese}.` : 'No ha iniciado sesión.';
    let minutesPassed = 0;
    if (this.usrToken) {
      const decodedToken = this.jwtHelper.decodeToken(this.usrToken);      
      const start = moment(decodedToken.inicia);
      minutesPassed = moment().diff(start, 'minutes');
      const tiempo = minutesPassed >= 60 ? (minutesPassed / 60) : minutesPassed;
      ese = tiempo === 1 ? '' : 's';
      const medida = (minutesPassed >= 60 ? 'hora' : 'minuto') + ese;
      this.tiempoTranscurrido = `${tiempo} ${medida}.`
    }
  }

  cerrar = () => this.dialogRef.close();

}
