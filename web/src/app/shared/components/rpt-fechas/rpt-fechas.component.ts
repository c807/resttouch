import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GLOBAL } from '@shared/global';
import * as moment from 'moment';

import { ConfiguracionFechas } from '@shared-interfaces/config-reportes';

@Component({
  selector: 'app-rpt-fechas',
  templateUrl: './rpt-fechas.component.html',
  styleUrls: ['./rpt-fechas.component.css']
})
export class RptFechasComponent implements OnInit {

  @Input() fdel: string = moment().format(GLOBAL.dbDateFormat);
  @Output() fdelChange = new EventEmitter();

  @Input() fal: string = moment().format(GLOBAL.dbDateFormat);
  @Output() falChange = new EventEmitter();

  @Input() configuracion: ConfiguracionFechas = { isRequiredFDel: true, isRequiredFAl: true };

  constructor() { }

  ngOnInit() {
  }

  onFDelChange = () => this.fdelChange.emit(this.fdel);
  onFAlChange =  () => this.falChange.emit(this.fal);

}
