import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaProveedorComponent } from '../lista-proveedor/lista-proveedor.component';
import { Proveedor } from '../../../../wms/interfaces/proveedor';

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.css']
})
export class ProveedorComponent implements OnInit {

  public proveedor: Proveedor;
  @ViewChild('lstProveedor') lstProveedorComponent: ListaProveedorComponent;

  constructor() {
    this.proveedor = {
      proveedor: null,
      corporacion: null,
      razon_social: null,
      nit: null,
      codigo: null, 
      cuenta_contable_gasto: null
    };
  }

  ngOnInit() {
  }

  setProveedor = (prov: Proveedor) => this.proveedor = prov;

  refreshProveedorList = () => this.lstProveedorComponent.loadProveedores();

}
