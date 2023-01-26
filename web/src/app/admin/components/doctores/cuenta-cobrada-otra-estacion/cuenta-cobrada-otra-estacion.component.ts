import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogModel, ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';

import { Cuenta } from '@restaurante-interfaces/cuenta';
import { ComandaService } from '@restaurante-services/comanda.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cuenta-cobrada-otra-estacion',
  templateUrl: './cuenta-cobrada-otra-estacion.component.html',
  styleUrls: ['./cuenta-cobrada-otra-estacion.component.css']
})
export class CuentaCobradaOtraEstacionComponent implements OnInit, OnDestroy {

  public cargando = false;
  public params: any = {
    comanda: null,
    cerrada: 0
  };
  public cuentas: Cuenta[] = [];
  public titulo = 'Arreglar cuenta cobrada en otra estación';

  private endSubs = new Subscription();

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    public comandaSrvc: ComandaService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  obtenerCuentasAbiertas = () => {
    this.cargando = true;
    this.cuentas = [];
    this.endSubs.add(
      this.comandaSrvc.getCuentasComanda(this.params).subscribe(res => {
        this.cuentas = res;
        this.cargando = false;
        if (this.cuentas.length === 0) {
          this.snackBar.open(this.titulo, `La comanda ${this.params.comanda} no tiene cuentas abiertas.`, { duration: 8000 });
        }
      })
    );
  }

  procesar = () => {
    const mensaje = `Este proceso revisara si la cuenta <b>'${this.params.cuenta.nombre} - ${this.params.cuenta.numero}'</b> de la comanda <b>'${this.params.comanda}'</b> realmente esta disponible para cobrar. 
    Si ya hay una factura asociada a esa cuenta, la cerrará y le mostrará datos para que pueda ubicar la cuenta. 
    Si no hay factura asociada, intentará eliminar las formas de pago asociadas para poder continuar con el proceso normal.<br/><b>¿Está seguro(a) de continuar?<b>`;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        this.titulo,
        mensaje,
        'Sí', 'No', null, true, true
      )
    });

    this.endSubs.add(
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.cargando = true;
          this.params.comanda = +this.params.comanda;
          this.params.idcuenta = +this.params.cuenta.cuenta;
          this.endSubs.add(
            this.comandaSrvc.fixCuentaCobradaEnOtraEstacion(this.params).subscribe(res => {
              this.dialog.open(ConfirmDialogComponent, { maxWidth: '500px', data: new ConfirmDialogModel(this.titulo, res.mensaje, 'Ok', '') });
              this.cargando = false;
              this.params = { comanda: null, cerrada: 0 };
              this.cuentas = [];
            })
          );
        }
      })
    );
  }


}
