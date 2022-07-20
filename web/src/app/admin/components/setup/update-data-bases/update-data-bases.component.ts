import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

import { SetupService } from '../../../services/setup.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-update-data-bases',
  templateUrl: './update-data-bases.component.html',
  styleUrls: ['./update-data-bases.component.css']
})
export class UpdateDataBasesComponent implements OnInit, OnDestroy {

  public instrucciones = { sql: null };
  public cargando = false;

  private endSubs = new Subscription();

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,    
    private setupSrvc: SetupService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  onSubmit = () => {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Actualización de esquemas',
        'Este proceso actualizará todas las bases de datos existentes y puede tardar un poco. ¿Desea continuar?',
        'Sí',
        'No'
      )
    });

    this.endSubs.add(
      confirmRef.afterClosed().subscribe((conf: boolean) => {
        if (conf) {
          this.cargando = true;
          this.endSubs.add(
            this.setupSrvc.actualizar_esquema(this.instrucciones.sql).subscribe(res => {
              this.snackBar.open(`${res.exito ? '' : 'ERROR: '}${res.mensaje}`, 'Actualización de esquemas', { duration: 7000 });
              this.cargando = false;
              if(res.exito) {
                this.instrucciones.sql = null;
              }
            })
          );
        }
      })
    );
  }  

}
