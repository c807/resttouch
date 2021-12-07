import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Impresora } from '../../../admin/interfaces/impresora';
import { Cuenta } from '../../interfaces/cuenta';

import { ComandaService } from '../../services/comanda.service';

interface IDatosCuentas {
  lstProductosSeleccionados: [{
    id: number;
    nombre: string;
    cuenta?: number;
    cantidad: number;
    impreso: number;
    precio?: number;
    total?: number;
    notas?: string;
    showInputNotas: boolean;
    itemListHeight: string;
    detalle_comanda?: number;
    detalle_cuenta?: number;
    impresora?: Impresora;
  }];
  mesaEnUso: {
    area: string;
    noMesa: number;
    cuentas: [{
      numero: number,
      nombre: string
    }];
  };
}

@Component({
  selector: 'app-unir-cuenta',
  templateUrl: './unir-cuenta.component.html',
  styleUrls: ['./unir-cuenta.component.css']
})
export class UnirCuentaComponent implements OnInit {

  public cuentaDe: Cuenta;
  public cuentaA: Cuenta;

  constructor(
    public dialogRef: MatDialogRef<UnirCuentaComponent>,
    private comandaSrvc: ComandaService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: IDatosCuentas
  ) { }

  ngOnInit() {
    // console.log('Productos enviados = ', this.data.lstProductosSeleccionados);
  }

  cancelar() {
    this.dialogRef.close(false);
  }

  unirCuentas(deCuenta: Cuenta, aCuenta: Cuenta) {
    // console.log('ORIGEN', deCuenta);
    // console.log('DESTINO', aCuenta);
    this.comandaSrvc.unificarCuentas(deCuenta.cuenta, aCuenta.cuenta).subscribe(res => {
      // console.log(res);
      if (res.exito) {
        this.snackBar.open(res.mensaje, 'Cuentas', { duration: 3000 });
        this.dialogRef.close(true);
      } else {
        this.snackBar.open(`ERROR:${res.mensaje}`, 'Cuentas', { duration: 7000 });
      }
    });    
  }
}
