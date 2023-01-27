import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { ProductoSelected } from '@wms-interfaces/articulo';
import { DetalleCuentaSimplified } from '@restaurante-interfaces/cuenta';

export class ElminarProductoModel {
  constructor(
    public producto: (DetalleCuentaSimplified | ProductoSelected)
  ) { }
}

@Component({
  selector: 'app-dialog-elminar-producto',
  templateUrl: './dialog-elminar-producto.component.html',
  styleUrls: ['./dialog-elminar-producto.component.css']
})
export class DialogElminarProductoComponent implements OnInit {

  get usaWMS() {
    // const accesos: any[] = this.ls.get('acceso') || [];
    // const idxWms = accesos.findIndex(a => a.nombre === 'WMS');
    return (this.ls.get(GLOBAL.usrTokenVar).acceso as Array<any> || []).findIndex(a => a.nombre === 'WMS') > -1;
  }

  public prod: (DetalleCuentaSimplified | ProductoSelected)
  public datos: any = {};
  public cantidad: number = 0;
  public color = this.usaWMS ? 'primary' : 'accent';  

  constructor(
    public dialogRef: MatDialogRef<DialogElminarProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ElminarProductoModel,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService
  ) {
    this.prod = data.producto
    this.cantidad = +this.prod.cantidad;
    this.datos = {
      respuesta: false,
      producto: null
    };
  }

  ngOnInit() { }

  onConfirm(retornar_inventario = true): void {
    if (this.cantidad < 1 || this.cantidad > this.prod.cantidad){
      this.snackBar.open('La cantidad debe estar entre 1 y '+this.prod.cantidad, 'Error', { duration: 5000 });
    } else {
      this.datos.respuesta = true;
      // this.prod.cantidad -= this.cantidad
      this.prod.cantidad = this.cantidad
      this.datos.producto = this.prod;
      this.datos.retornar_inventario = !this.usaWMS ? true : retornar_inventario;
      this.dialogRef.close(this.datos);
    }
  }

  onDismiss(): void {
    this.datos.respuesta = false;
    this.dialogRef.close(this.datos);
  }

}
