import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../services/localstorage.service';

import { Proveedor } from '../../../../wms/interfaces/proveedor';
import { ProveedorService } from '../../../../wms/services/proveedor.service';

@Component({
  selector: 'app-form-proveedor',
  templateUrl: './form-proveedor.component.html',
  styleUrls: ['./form-proveedor.component.css']
})
export class FormProveedorComponent implements OnInit {

  @Input() proveedor: Proveedor;
  @Output() proveedorSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  constructor(
    private snackBar: MatSnackBar,
    private proveedorSrvc: ProveedorService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  resetProveedor = () => this.proveedor = {
    proveedor: null,
    corporacion: null,
    razon_social: null,
    nit: null,
    codigo: null,
    cuenta_contable_gasto: null
  }

  onSubmit = () => {
    this.proveedor.nit = this.proveedor.nit.trim().toUpperCase().replace(/[^0-9KkcCfF]/gi, '');
    this.proveedorSrvc.save(this.proveedor).subscribe(res => {
      if (res.exito) {
        this.proveedorSavedEv.emit();
        this.resetProveedor();
        this.snackBar.open('Proveedor agregado...', 'Proveedores', { duration: 3000 });
      } else {
        this.snackBar.open(`ERROR: ${res.mensaje}`, 'Proveedores', { duration: 3000 });
      }
    });
  }
}
