import { Component, OnInit } from '@angular/core';
import { GLOBAL } from '@shared/global';
import * as moment from 'moment';

import { ConfiguracionFechas, ConfiguracionBotones } from '@shared-interfaces/config-reportes';

@Component({
  selector: 'app-turnos',
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.css']
})
export class TurnosComponent implements OnInit {

  public params: any = {};
  public configParams: ConfiguracionFechas = {
    isRequiredFDel: true, isRequiredFAl: true
  };
  public configBotones: ConfiguracionBotones = {
    isHtmlDisabled: false, isPdfDisabled: false, isExcelDisabled: false
  };
  public cargando = false;

  constructor() { }

  ngOnInit() {
    this.resetParams();
  }

  resetParams = () => {
    this.params = {
      fdel: moment().startOf('week').format(GLOBAL.dbDateFormat),
      fal: moment().endOf('week').format(GLOBAL.dbDateFormat)
    };
    // console.log(this.params);
  }

  getReporte = () => {
    console.log('GENERANDO CON PARAMETROS = ', this.params);
  }
}
