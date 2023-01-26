import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaTipoCompraVentaComponent } from '@admin-components/tipoCompraVenta/lista-tipo-compra-venta/lista-tipo-compra-venta.component';
import { TipoCompraVenta } from '@admin-interfaces/tipo-compra-venta';

@Component({
  selector: 'app-tipo-compra-venta',
  templateUrl: './tipo-compra-venta.component.html',
  styleUrls: ['./tipo-compra-venta.component.css']
})
export class TipoCompraVentaComponent implements OnInit {

  public tipoCompraVenta: TipoCompraVenta;
  @ViewChild('lstTipoCompraVenta') lstTipoCompraVenta: ListaTipoCompraVentaComponent;

  constructor() {
    this.tipoCompraVenta = { tipo_compra_venta: null, descripcion: null, abreviatura: null, codigo: null };
  }

  ngOnInit(): void {
  }

  setTipoCompraVenta = (tcv: TipoCompraVenta) => this.tipoCompraVenta = tcv;

  refreshTipoCompraVentaList = () => this.lstTipoCompraVenta.loadTiposCompraVenta();

}
