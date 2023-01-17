import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Sede } from '../../../../admin/interfaces/sede';
import { SedeService } from '../../../../admin/services/sede.service';
import { ArticuloService } from '../../../services/articulo.service';
import { Articulo } from '../../../interfaces/articulo';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-replicar-asedes',
  templateUrl: './replicar-a-sedes.component.html',
  styleUrls: ['./replicar-a-sedes.component.css']
})
export class ReplicarASedesComponent implements OnInit, OnDestroy {

  @Input() articulo: Articulo = null;

  public cargando = false;
  public sedes: Sede[] = [];
  public params: any = {};
  public miSede = 0;

  private endSubs = new Subscription();

  constructor(
    private sedeSrvc: SedeService,
    private ls: LocalstorageService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private articuloSrvc: ArticuloService
  ) { }

  ngOnInit() {
    this.miSede = this.ls.get(GLOBAL.usrTokenVar).sede || 0;
    this.loadSedes();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  loadSedes = () => {
    this.endSubs.add(
      this.sedeSrvc.get().subscribe(res => {
        this.sedes = res;
      })
    );
  }

  onSubmit = () => {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Replicar artículos',
        'Este proceso replicará TODOS los artículos a las sedes seleccionadas. ¿Desea continuar?',
        'Sí', 'No'
      )
    });

    this.endSubs.add(
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.cargando = true;
          const obj = { sedes: [], articulo: null };
          this.params.sede.forEach((s: string) => obj.sedes.push({ sede: +s }));

          if (this.articulo) {
            obj.articulo = +this.articulo.articulo;
          }

          this.endSubs.add(
            this.articuloSrvc.replicaArticulosEnSedes(obj).subscribe(resReplica => {
              if (resReplica.exito) {
                this.snackBar.open(resReplica.mensaje, 'Replicar artículos', { duration: 3000 });
              } else {
                this.snackBar.open(`ERROR: ${resReplica.mensaje}`, 'Replicar artículos', { duration: 7000 });
              }
              this.params = {};
              this.cargando = false;
            })
          );
        }
      })
    );
  }

}
