import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { ContenidoCombo, IOpcion } from '@wms-interfaces/articulo';

interface IDataArmarCombo {
  descripcion: string;
  cantidadCombos: number;
  multiples: ContenidoCombo[];
}

@Component({
  selector: 'app-armar-combo',
  templateUrl: './armar-combo.component.html',
  styleUrls: ['./armar-combo.component.css']
})
export class ArmarComboComponent implements OnInit {

  get sumaCantidad() {
    return (opc: IOpcion) => {
      let cantidad = 0;
      for (const sel of opc.selecciones) {
        cantidad += +sel.cantidad;
      }
      return +cantidad;
    }
  }

  get deshabilitarGuardar() {
    return (opc: IOpcion) => {
      let cantidad = this.sumaCantidad(opc);
      return +cantidad >= +opc.maximo;
    }
  }

  public opciones: IOpcion[] = [];
  public seleccionado: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ArmarComboComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDataArmarCombo,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    if (this.data.multiples.length > 0) {
      for (const opc of this.data.multiples) {
        this.opciones.push({
          opcion: opc.articulo,
          descripcion: opc.descripcion,
          minimo: +this.data.cantidadCombos * +opc.cantidad_minima,
          maximo: +this.data.cantidadCombos * +opc.cantidad_maxima,
          multiple: +opc.multiple,
          precio: +opc.precio,
          precio_extra: +opc.precio_extra,
          cantidad: 0,
          disponibles: opc.opciones,
          selecciones: []
        });
        this.seleccionado.push({ cantidad: null, opcion: null });
      }
    }
  }

  terminar = () => {
    if (this.checkComboArmado()) {
      this.dialogRef.close(this.opciones);
    }
  }

  addSeleccion = (opc: IOpcion, sel: any, idx: number) => {    
    if (+sel.cantidad > 0 && +sel.cantidad <= +opc.maximo) {
      const agregados: number = this.sumaCantidad(opc);
      if ((agregados + +sel.cantidad) <= +opc.maximo) {
        this.opciones[idx].selecciones.push({
          cantidad: +sel.cantidad,
          articulo: +sel.opcion.articulo,
          descripcion: sel.opcion.descripcion,
          multiple: +sel.opcion.multiple,
          precio: +sel.opcion.precio,
          precio_extra: +sel.opcion.precio_extra
        });
      } else {
        this.snackBar.open(`La cantidad seleccionada supera el máximo permitido (${opc.maximo})`, 'Selecciones', { duration: 3000 });
      }
    } else {
      this.snackBar.open(`La cantidad debe ser mayor a 0 y menor al máximo (${opc.maximo})`, 'Selecciones', { duration: 5000 });
    }

    this.seleccionado[idx] = { cantidad: null, opcion: null };
  }

  removeSeleccion = (opc: IOpcion, i: number, j: number) => this.opciones[i].selecciones.splice(j, 1);

  checkComboArmado = (): boolean => {
    let armado = true;
    let mensajes: string[] = [];
    for (const opc of this.opciones) {
      const cantidad = this.sumaCantidad(opc);
      if (!(cantidad >= opc.minimo && cantidad <= opc.maximo)) {
        armado = false;
        mensajes.push(opc.descripcion);
      } else {
        opc.cantidad = +this.data.cantidadCombos !== 0 ? cantidad / +this.data.cantidadCombos : 0;
      }
    }

    if (!armado) {
      this.snackBar.open(`Hay opiciones pendientes de seleccionar: ${mensajes.join('; ')}.`, 'Selecciones', { duration: 10000 });
    }    
    
    return armado;
  }

}
