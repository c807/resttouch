import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { DetalleCuentaSimplified } from '@restaurante-interfaces/cuenta';

interface IDataAccionesArticuloComanda {
  p: DetalleCuentaSimplified;
}

@Component({
  selector: 'app-m-acciones-articulo-comanda',
  templateUrl: './m-acciones-articulo-comanda.component.html',
  styleUrls: ['./m-acciones-articulo-comanda.component.css']
})
export class MAccionesArticuloComandaComponent implements OnInit {

  constructor(
    private bsAccionesArticuloComanda: MatBottomSheetRef<MAccionesArticuloComandaComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: IDataAccionesArticuloComanda,
  ) { }

  ngOnInit(): void {
  }

  cerrar = (accion: number) => { this.bsAccionesArticuloComanda.dismiss(accion); }

}
