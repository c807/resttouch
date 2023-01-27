import { Component, OnInit, ViewChild } from '@angular/core';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { GLOBAL } from '@shared/global';
import * as moment from 'moment';

import { ListaOrdenCompraComponent } from '@orden-compra-components/orden-compra/lista-orden-compra/lista-orden-compra.component';
import { FormOrdenCompraComponent } from '@orden-compra-components/orden-compra/form-orden-compra/form-orden-compra.component';
import { OrdenCompra } from '@orden-compra-interfaces/orden-compra';

@Component({
  selector: 'app-orden-compra',
  templateUrl: './orden-compra.component.html',
  styleUrls: ['./orden-compra.component.css']
})
export class OrdenCompraComponent implements OnInit {

  public ordenCompra: OrdenCompra;
  @ViewChild('lstOrdenCompra') lstOrdenCompraComponent: ListaOrdenCompraComponent;
  @ViewChild('frmOrdenCompra') frmOrdenCompra: FormOrdenCompraComponent;

  constructor(
    private ls: LocalstorageService
  ) {
    this.ordenCompra = {
      orden_compra: null, proveedor: null, usuario: (this.ls.get(GLOBAL.usrTokenVar).idusr || 0), notas: null, estatus_movimiento: 1, bodega: null,
      tipo_movimiento: null, fecha_orden: moment().format(GLOBAL.dbDateFormat), sede: (this.ls.get(GLOBAL.usrTokenVar).sede || 0)
    };
  }

  ngOnInit() {
  }

  setOrdenCompra = (oc: OrdenCompra) => {
    //console.log(oc);
    this.ordenCompra = oc;
    this.frmOrdenCompra.ordenCompra = this.ordenCompra;
    this.frmOrdenCompra.resetDetalleOrdenCompra();
    this.frmOrdenCompra.loadDetalleOrdenCompra(+this.ordenCompra.orden_compra);
    this.frmOrdenCompra.setProviderName();
  }

  refreshOrdenCompraList = () => {
    this.lstOrdenCompraComponent.loadOrdenesCompra();
  }

}
