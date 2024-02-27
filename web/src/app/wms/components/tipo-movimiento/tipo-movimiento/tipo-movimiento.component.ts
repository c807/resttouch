import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaTipoMovimientoComponent } from '@wms-components/tipo-movimiento/lista-tipo-movimiento/lista-tipo-movimiento.component';
import { TipoMovimiento } from '@wms-interfaces/tipo-movimiento';

@Component({
  selector: 'app-tipo-movimiento',
  templateUrl: './tipo-movimiento.component.html',
  styleUrls: ['./tipo-movimiento.component.css']
})
export class TipoMovimientoComponent implements OnInit {

  public tipoMovimiento: TipoMovimiento;
  @ViewChild('lstTipoMovimiento') lstTipoMovimiento: ListaTipoMovimientoComponent;

  constructor() {
    this.tipoMovimiento = { tipo_movimiento: null, descripcion: null, ingreso: 0, egreso: 0, requisicion: 0, esajuste_cp: 0 };
  }

  ngOnInit(): void {
  }

  setTipoMovimiento = (tm: TipoMovimiento) => {
    this.tipoMovimiento = { tipo_movimiento: null, descripcion: null, ingreso: 0, egreso: 0, requisicion: 0, esajuste_cp: 0 };
    for (let i in tm) {
      this.tipoMovimiento[i] = tm[i]
    }
  };

  refreshTipoMovimientoList = () => this.lstTipoMovimiento.loadTiposMovimiento();

}
