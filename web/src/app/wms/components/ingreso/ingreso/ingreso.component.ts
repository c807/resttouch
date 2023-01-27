import { Component, OnInit, ViewChild } from '@angular/core';
import { LocalstorageService } from '@admin/services/localstorage.service';
import { GLOBAL } from '@shared/global';
import * as moment from 'moment';

import { ListaIngresoComponent } from '@wms-components/ingreso/lista-ingreso/lista-ingreso.component';
import { FormIngresoComponent } from '@wms-components/ingreso/form-ingreso/form-ingreso.component';
import { Ingreso } from '@wms-interfaces/ingreso';

@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.component.html',
  styleUrls: ['./ingreso.component.css']
})
export class IngresoComponent implements OnInit {

  public ingreso: Ingreso;
  @ViewChild('lstIngreso') lstIngresoComponent: ListaIngresoComponent;
  @ViewChild('frmIngreso') frmIngreso: FormIngresoComponent;
  public breakpoint = 2;  

  constructor(
    private ls: LocalstorageService
  ) {
    this.ingreso = {
      ingreso: null, tipo_movimiento: null, fecha: moment().format(GLOBAL.dbDateFormat), bodega: null,
      usuario: (this.ls.get(GLOBAL.usrTokenVar).idusr || 0), comentario: null, proveedor: null
    };
  }

  ngOnInit() {
    this.breakpoint = (window.innerWidth <= 360) ? 1 : 2;
  }

  onWindowResize = (ev: any) => {
    this.breakpoint = (ev.target.innerWidth <= 360) ? 1 : 2;
  }

  setIngreso = (ing: Ingreso) => {
    this.ingreso = ing;
    this.frmIngreso.setProveedor(+this.ingreso.proveedor);
    this.frmIngreso.loadDetalleIngreso(+this.ingreso.ingreso);
    this.frmIngreso.resetDetalleIngreso();
    this.frmIngreso.loadDocumento(this.ingreso.ingreso);
  }

  refreshIngresoList = () => {
    this.lstIngresoComponent.loadIngresos();
  }
}
