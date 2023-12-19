import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { GLOBAL } from '@shared/global';
import * as moment from 'moment';

import { DashboardParameters } from '@admin/interfaces/tablero';
import { UsuarioSede } from '@admin-interfaces/acceso';
import { AccesoUsuarioService } from '@admin/services/acceso-usuario.service';
import { LocalstorageService } from '@admin/services/localstorage.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-parameters',
  templateUrl: './dashboard-parameters.component.html',
  styleUrls: ['./dashboard-parameters.component.css']
})
export class DashboardParametersComponent implements OnInit, OnDestroy {

  @Input() tipoDashboard: number = 1;
  @Output() refreshAllEv = new EventEmitter<DashboardParameters>();
  public params: DashboardParameters = {};
  public sedes: UsuarioSede[] = [];

  private endSubs = new Subscription();

  constructor(
    private sedeSrvc: AccesoUsuarioService,
    private ls: LocalstorageService,
  ) { }

  ngOnInit(): void {
    this.resetParams();
    this.loadSedes();
    this.refreshAll();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetParams = () => {
    this.params = {
      // fdel: +this.tipoDashboard === 1 ? moment().format(GLOBAL.dbDateFormat) : null,
      fdel: +this.tipoDashboard === 1 ? moment('2023-10-13').format(GLOBAL.dbDateFormat) : null, //Solo para pruebas
      // fal: +this.tipoDashboard === 1 ? moment().format(GLOBAL.dbDateFormat) : null,
      fal: +this.tipoDashboard === 1 ? moment('2023-10-13').format(GLOBAL.dbDateFormat) : null, //Solo para pruebas
      sede: this.ls.get(GLOBAL.usrTokenVar).sede.toString() || '0',
      tipo_turno: null
    }
  }

  loadSedes = (params: any = {}) => {
    this.endSubs.add(
      this.sedeSrvc.getSedes(params).subscribe(res => {
        this.sedes = [...res];
      })
    );
  }

  refreshAll = () => this.refreshAllEv.emit(this.params);
}
