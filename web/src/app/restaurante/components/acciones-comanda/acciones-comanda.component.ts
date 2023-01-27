import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialogRef } from '@angular/material/dialog';

import { TranComandaAltComponent } from '@restaurante-components/tran-comanda-alt/tran-comanda-alt.component';
import { TranComanda } from '@restaurante-classes/tran-comanda';

interface ITranComanda {
  tranComanda: TranComanda;
  dialogRef: MatDialogRef<TranComandaAltComponent>;
}

@Component({
  selector: 'app-acciones-comanda',
  templateUrl: './acciones-comanda.component.html',
  styleUrls: ['./acciones-comanda.component.css']
})
export class AccionesComandaComponent implements OnInit {

  constructor(
    private bsAccionesComanda: MatBottomSheetRef<AccionesComandaComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: ITranComanda
  ) { }

  ngOnInit(): void {
  }

  cerrar = (obj: any = { cerrar: false }) => this.bsAccionesComanda.dismiss(obj);

  notasGenerales = () => {
    this.data.tranComanda.getNotasGenerales();
    this.cerrar();
  }

  comandar = () => {
    this.data.tranComanda.validarImpresion(false, this.data.dialogRef);
    this.cerrar();
  }

  imprimirCuenta = () => {
    this.data.tranComanda.printCuenta(this.data.dialogRef);
    this.cerrar();
  }

  distribuirProductos = () => {
    this.data.tranComanda.distribuirProductos(this.data.dialogRef);
    this.cerrar();
  }

  unirCuentas = () => {
    this.data.tranComanda.unirCuentas(this.data.dialogRef);
    this.cerrar();
  }

  cobrarCuenta = () => {
    this.data.tranComanda.cobrarCuenta(this.data.dialogRef);
    this.cerrar();
  }

  enviarPedido = () => {
    this.data.tranComanda.enviarPedido(this.data.dialogRef);
    this.cerrar();
  }

  trasladarMesa = (idCuenta: number = null) => {
    this.data.tranComanda.trasladoMesa(this.data.dialogRef, idCuenta);
    this.cerrar();
  }

  cerrarMesa = () => {
    this.data.tranComanda.cerrarMesa();
    this.cerrar({
      cerrar: true,
      mesaEnUso: this.data.tranComanda.mesaEnUso
    });
  }

  verHistorico = () => {
    this.data.tranComanda.verHistorico();
    this.cerrar();
  }
}
