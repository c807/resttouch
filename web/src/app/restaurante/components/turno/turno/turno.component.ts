import { Component, OnInit, ViewChild } from '@angular/core';
import { GLOBAL } from '@shared/global';
import * as moment from 'moment';

import { ListaTurnoComponent } from '@restaurante-components/turno/lista-turno/lista-turno.component';
import { FormTurnoComponent } from '@restaurante-components/turno/form-turno/form-turno.component';
import { Turno } from '@restaurante-interfaces/turno';

@Component({
  selector: 'app-turno',
  templateUrl: './turno.component.html',
  styleUrls: ['./turno.component.css']
})
export class TurnoComponent implements OnInit {

  public turno: Turno;
  @ViewChild('lstTurno') lstTurnoComponent: ListaTurnoComponent;
  @ViewChild('frmTurno') frmTurno: FormTurnoComponent;

  constructor() {
    this.turno = {
      turno: null, turno_tipo: null, inicio: moment().format(GLOBAL.dbDateTimeFormat), fin: null
    };
  }

  ngOnInit() {
  }

  setTurno = (trn: Turno) => {
    this.turno = trn;
    this.frmTurno.turno = this.turno;
    this.frmTurno.turnoOriginal = { ...this.frmTurno.turno };
    this.frmTurno.loadDetalleTurno(+this.turno.turno);
    this.frmTurno.pendientes = false;
    this.frmTurno.comandas = [];
    this.frmTurno.facturas = [];
  }

  refreshTurnoList = () => this.lstTurnoComponent.loadTurnos();
}
