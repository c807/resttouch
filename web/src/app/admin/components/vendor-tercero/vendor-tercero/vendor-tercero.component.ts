import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaVendorTerceroComponent } from '@admin-components/vendor-tercero/lista-vendor-tercero/lista-vendor-tercero.component';
import { FormVendorTerceroComponent } from '@admin-components/vendor-tercero/form-vendor-tercero/form-vendor-tercero.component';
import { VendorTerceroResponse, VendorTercero } from '@admin-interfaces/vendor-tercero';

@Component({
  selector: 'app-vendor-tercero',
  templateUrl: './vendor-tercero.component.html',
  styleUrls: ['./vendor-tercero.component.css']
})
export class VendorTerceroComponent implements OnInit {

  public vendorTercero: VendorTercero;
  @ViewChild('lstVendorTercero') lstVendorTercero: ListaVendorTerceroComponent;
  @ViewChild('frmVendorTercero') frmVendorTercero: FormVendorTerceroComponent;

  constructor() {
    this.vendorTercero = { vendor_tercero: null, nombre: null, comanda_origen: null }
  }

  ngOnInit(): void {
  }

  setVendorTercero = (obj: VendorTerceroResponse) => {
    this.vendorTercero = {
      vendor_tercero: obj.vendor_tercero,
      nombre: obj.nombre,
      comanda_origen: obj.comanda_origen.comanda_origen
    }
    this.frmVendorTercero.vendorTercero = this.vendorTercero;
    this.frmVendorTercero.frmSedeVendorTercero.resetSedeVendorTercero();
    this.frmVendorTercero.frmSedeVendorTercero.sedeVendorTercero.vendor_tercero = this.vendorTercero.vendor_tercero;
    this.frmVendorTercero.frmSedeVendorTercero.getSedeVendorTercero();
  }

  refreshVendorTerceroList = () => this.lstVendorTercero.loadVendorTercero();

}
