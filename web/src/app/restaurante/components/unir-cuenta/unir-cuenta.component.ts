import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Impresora } from '@admin-interfaces/impresora';
import { Cuenta } from '@restaurante-interfaces/cuenta';
import { ComandaService } from '@restaurante-services/comanda.service';

import { Subscription } from 'rxjs';

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
    notas_predefinidas?: string;
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
export class UnirCuentaComponent implements OnInit, OnDestroy {

  public cuentaDe: Cuenta;
  public cuentaA: Cuenta;

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<UnirCuentaComponent>,
    private comandaSrvc: ComandaService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: IDatosCuentas
  ) { }

  ngOnInit() { }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  cancelar() {
    this.dialogRef.close(false);
  }

  unirCuentas(deCuenta: Cuenta, aCuenta: Cuenta) {
    this.endSubs.add(
      this.comandaSrvc.unificarCuentas(deCuenta.cuenta, aCuenta.cuenta).subscribe(res => {
        if (res.exito) {
          this.snackBar.open(res.mensaje, 'Cuentas', { duration: 3000 });
          this.dialogRef.close(true);
        } else {
          this.snackBar.open(`ERROR:${res.mensaje}`, 'Cuentas', { duration: 7000 });
        }
      })
    );
  }
}
