import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalstorageService } from '../../../admin/services/localstorage.service';
// import { GLOBAL } from '../../../shared/global';

import { ContenidoCombo } from '../../../wms/interfaces/articulo';

interface IDataArmarCombo {
  descripcion: string;
  cantidadCombos: number;
  multiples: ContenidoCombo[];
}

interface ISeleccion {
  cantidad: number;
  seleccion: number;
}

interface IOpcion {
  opcion: number;
  descripcion: string;
  minimo: number;
  maximo: number;
  selecciones: ISeleccion[];
}

@Component({
  selector: 'app-armar-combo',
  templateUrl: './armar-combo.component.html',
  styleUrls: ['./armar-combo.component.css']
})
export class ArmarComboComponent implements OnInit {

  public opciones: IOpcion[] = [];

  constructor(
    public dialogRef: MatDialogRef<ArmarComboComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDataArmarCombo,
    private snackBar: MatSnackBar,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    if (this.data.multiples.length > 0) {
      for(const opc of this.data.multiples) {
        this.opciones.push({
          opcion: opc.articulo,
          descripcion: opc.descripcion,
          minimo: +this.data.cantidadCombos * +opc.cantidad_minima,
          maximo: +this.data.cantidadCombos * +opc.cantidad_maxima,
          selecciones: []
        });
      }      
    }
  }

  terminar = () => {
    this.dialogRef.close('Armando combo...');
  }

}
