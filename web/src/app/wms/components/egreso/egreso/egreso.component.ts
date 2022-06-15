import { Component, OnInit, ViewChild } from '@angular/core';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { GLOBAL } from '../../../../shared/global';
import * as moment from 'moment';
import { ListaEgresoComponent } from '../lista-egreso/lista-egreso.component';
import { FormEgresoComponent } from '../form-egreso/form-egreso.component';
import { Egreso } from '../../../interfaces/egreso';

@Component({
  selector: 'app-egreso',
  templateUrl: './egreso.component.html',
  styleUrls: ['./egreso.component.css']
})
export class EgresoComponent implements OnInit {

  public egreso: Egreso;
  @ViewChild('lstEgreso') lstEgresoComponent: ListaEgresoComponent;
  @ViewChild('frmEgreso') frmEgreso: FormEgresoComponent;

  constructor(
    private ls: LocalstorageService
  ) {
    this.egreso = {
      egreso: null, tipo_movimiento: null, bodega: null, fecha: moment().format(GLOBAL.dbDateFormat),
      usuario: (this.ls.get(GLOBAL.usrTokenVar).idusr || 0), estatus_movimiento: 1, traslado: 0
    };
  }

  ngOnInit() {
  }

  setEgreso = (egr: Egreso) => {    
    this.egreso = egr;
    this.frmEgreso.resetDetalleEgreso();
    this.frmEgreso.loadDetalleEgreso(+this.egreso.egreso);
  }

  refreshEgresoList = () => {
    this.lstEgresoComponent.loadEgresos();
  }

}
