import { Component, OnInit, ViewChild } from '@angular/core';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { GLOBAL } from '../../../../shared/global';
import * as moment from 'moment';
import { ListaIngresoComponent } from '../lista-ingreso/lista-ingreso.component';
import { FormIngresoComponent } from '../form-ingreso/form-ingreso.component';
import { Ingreso } from '../../../interfaces/ingreso';

@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.component.html',
  styleUrls: ['./ingreso.component.css']
})
export class IngresoComponent implements OnInit {

  public ingreso: Ingreso;
  @ViewChild('lstIngreso', { static: false }) lstIngresoComponent: ListaIngresoComponent;
  @ViewChild('frmIngreso', { static: false }) frmIngreso: FormIngresoComponent;

  constructor(
    private ls: LocalstorageService
  ) {
    this.ingreso = { 
      ingreso: null, tipo_movimiento: null, fecha: moment().format(GLOBAL.dbDateFormat), bodega: null, usuario: (this.ls.get(GLOBAL.usrTokenVar).idusr || 0), comentario: null, proveedor: null
    };
  }

  ngOnInit() {
  }

  setIngreso = (ing: Ingreso) => { 
    this.ingreso = ing;
    this.frmIngreso.loadDetalleIngreso(+this.ingreso.ingreso);
  }

  refreshIngresoList = () => {
    this.lstIngresoComponent.loadIngresos();
  }
}
