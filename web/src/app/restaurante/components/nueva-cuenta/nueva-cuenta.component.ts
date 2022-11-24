import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

import { Comanda, ComandaGetResponse } from '../../interfaces/comanda';
import { Cuenta } from '../../interfaces/cuenta';

import { ComandaService } from '../../services/comanda.service';

import { Subscription } from 'rxjs';

interface INuevaCuenta {
  mesaEnUso: ComandaGetResponse;
}

@Component({
  selector: 'app-nueva-cuenta',
  templateUrl: './nueva-cuenta.component.html',
  styleUrls: ['./nueva-cuenta.component.css']
})
export class NuevaCuentaComponent implements OnInit, OnDestroy {

  public comanda: Comanda;
  // public nuevaCuenta: Cuenta;
  public cargando = false;

  public nuevasCuentas: Cuenta[] = [];
  public conteoCuentas: number = 0;

  private endSubs = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<NuevaCuentaComponent>,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private comandaSrvc: ComandaService,
    @Inject(MAT_DIALOG_DATA) public data: INuevaCuenta
  ) { }

  ngOnInit() {
    if (+this.data.mesaEnUso.comanda > 0) {
      const meu = this.data.mesaEnUso;
      this.comanda = {
        area: +meu.mesa.area.area,
        mesa: +meu.mesa.mesa,
        mesero: +meu.mesero.usuario,
        comensales: meu.cuentas.length + 1,
        dividirCuentasPorSillas: 1,
        comanda: +meu.comanda,
        cuentas: meu.cuentas,
        replaceUnica: false,
        _no_get_comanda: true
      };
      // this.nuevaCuenta = {
      //   cuenta: 0,
      //   numero: this.comanda.cuentas.length + 1,
      //   nombre: undefined,
      //   productos: []
      // };

      this.conteoCuentas = this.comanda.cuentas.length + 1;
      this.addCuenta();
    }
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  cancelar = () => this.dialogRef.close(false);

  addCuenta = () => {
    this.nuevasCuentas.push({
      cuenta: null,
      comanda: this.comanda.comanda,
      nombre: `Cuenta #${this.conteoCuentas < 10 ? ('0' + this.conteoCuentas.toString()) : this.conteoCuentas}`,
      numero: this.conteoCuentas,
      cerrada: 0
    });
    this.conteoCuentas++;
  }

  delCuenta = (idx: number) => this.nuevasCuentas.splice(idx, 1);

  guardar = () => {
    const cantNuevasCtas = this.nuevasCuentas.length;
    const plural = cantNuevasCtas !== 1 ? 's' : '';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Cuentas',
        `Este proceso creará ${cantNuevasCtas} nueva${plural} cuenta${plural}. ¿Desea continuar?`,
        'Sí', 'No'
      )
    });

    this.endSubs.add(
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.cargando = true;
          let continuar = true;
          for (const nva of this.nuevasCuentas) {
            if (nva.nombre) {
              const idx = this.comanda.cuentas.findIndex(c => c.nombre.toUpperCase().trim() === nva.nombre.toUpperCase().trim());
              if (idx > -1) {
                this.snackBar.open(`Ya existe una cuenta con el nombre '${nva.nombre}'. Por favor ingrese otro nombre.`, 'Cuentas', { duration: 7000 });
                continuar = false;
                this.cargando = false;
                break;
              }
            } else {
              this.snackBar.open(`El nombre de la cuenta #${nva.numero} no es válido.`, 'Cuentas', { duration: 7000 });
              continuar = false;
              this.cargando = false;
              break;
            }
          }

          if (continuar) {
            this.nuevasCuentas.forEach(async (n) => await this.comandaSrvc.nueva_cuenta(n).toPromise());
            this.snackBar.open(`Cuenta${plural} creada${plural} con éxito.`, 'Cuentas', { duration: 10000 });
            this.cargando = false;
            this.dialogRef.close(true);
          }
        }
      })
    );
  }
}
