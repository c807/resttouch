import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { ConfirmDialogModel, ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';

import { BodegaService } from '@wms-services/bodega.service';
import { Bodega } from '@wms-interfaces/bodega';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-bodega',
  templateUrl: './form-bodega.component.html',
  styleUrls: ['./form-bodega.component.css']
})
export class FormBodegaComponent implements OnInit, OnDestroy {

  @Input() bodega: Bodega;
  @Output() bodegaSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private srvBodega: BodegaService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetBodega = () => this.bodega = {
    bodega: null, permitir_requisicion: 0, descripcion: null, sede: null, merma: null, pordefecto: 0, debaja: 0
  }

  onSubmit = () => {
    this.endSubs.add(
      this.srvBodega.save(this.bodega).subscribe(res => {
        if (res.exito) {
          this.bodegaSavedEv.emit();
          this.resetBodega();
          this.snackBar.open('Bodega agregada...', 'Bodega', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Bodega', { duration: 3000 });
        }
      })
    );
  }

  darDeBaja = () => {    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        'Bodega',
        'Luego de dar de baja esta bodega, no podrá utilizarla en ninguna transacción de WMS. ¿Desea continuar?',
        'Sí', 'No'
      )
    });

    this.endSubs.add(      
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.endSubs.add(
            this.srvBodega.darDeBaja(+this.bodega.bodega).subscribe(res => {
              if (res.exito) {
                this.bodegaSavedEv.emit();
                this.resetBodega();
                this.snackBar.open(res.mensaje, 'Bodega', { duration: 3000 });
              } else {
                this.snackBar.open(`ERROR: ${res.mensaje}`, 'Bodega', { duration: 7000 });
              }
            })
          );
        }
      })
    );

  }
}
