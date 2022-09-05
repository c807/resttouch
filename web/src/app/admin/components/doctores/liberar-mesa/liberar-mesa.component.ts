import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

import { MesaDisponible } from '../../../../restaurante/interfaces/mesa';
import { MesaService } from '../../../../restaurante/services/mesa.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-liberar-mesa',
  templateUrl: './liberar-mesa.component.html',
  styleUrls: ['./liberar-mesa.component.css']
})
export class LiberarMesaComponent implements OnInit, OnDestroy {

  public cargando = false;
  public mesas: MesaDisponible[] = [];
  public mesa: MesaDisponible = null;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    public mesaSrvc: MesaService,
  ) { }

  ngOnInit(): void {
    this.loadMesasOcupadas();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadMesasOcupadas = () => this.endSubs.add(this.mesaSrvc.getMesaFullData({ estatus: 2 }).subscribe(res => this.mesas = res));

  liberarMesa = () => {
    const mensaje = `Este proceso liberará la mesa '${this.mesa.area.nombre} - ${this.mesa.etiqueta || this.mesa.numero}', lo que implica que cerrará de forma forzada cualquier comanda y cuenta que esté relacionada. ¿Está seguro(a) que desea continuar?`;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Liberar mesa',
        mensaje,
        'Sí', 'No', null, true
      )
    });

    this.endSubs.add(
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.cargando = true;
          this.mesaSrvc.liberarMesaDr(+this.mesa.mesa).subscribe(res => {
            let msg = `${res.exito ? '' : 'ERROR: '}${res.mensaje}`;
            if (res.comandas_cerradas && +res.comandas_cerradas === 0) {
              msg += ' No se forzó el cierre comanda(s) y/o cuenta(s).';
            } else {
              const ese = +res.comandas_cerradas > 1 ? 's' : '';
              msg += ` Se forzó el cierre de la${ese} siguiente${ese} comanda${ese} ${res.comandas_relacionadas} y su${ese} cuenta${ese}.`;
            }
            this.mesa = null;
            this.loadMesasOcupadas();
            if (res.comandas_cerradas && +res.comandas_cerradas === 0) {
              this.snackBar.open(msg, 'Liberar mesa', { duration: 8000 });
            } else {
              this.dialog.open(ConfirmDialogComponent, { maxWidth: '500px', data: new ConfirmDialogModel('Liberar mesa', msg, 'Ok', '') });
            }
            this.cargando = false;
          })
        }
      })
    );
  }

}
