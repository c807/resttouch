import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { ConfirmDialogComponent, ConfirmDialogModel } from '@shared-components/confirm-dialog/confirm-dialog.component';

import { Presentacion } from '@admin-interfaces/presentacion';
import { PresentacionService } from '@admin-services/presentacion.service';
import { Medida } from '@admin-interfaces/medida';
import { MedidaService } from '@admin-services/medida.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-presentacion',
  templateUrl: './form-presentacion.component.html',
  styleUrls: ['./form-presentacion.component.css']
})
export class FormPresentacionComponent implements OnInit, OnDestroy {

  @Input() presentacion: Presentacion;
  @Output() presentacionSavedEv = new EventEmitter();
  public medidas: Medida[] = [];
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private presentacionSrvc: PresentacionService,
    private medidaSrvc: MedidaService,
    private ls: LocalstorageService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.resetPresentacion();
    this.loadMedidas();
  }

  ngOnDestroy() {
    this.endSubs.unsubscribe();
  }

  loadMedidas = () => {
    this.endSubs.add(
      this.medidaSrvc.get().subscribe(res => this.medidas = res || [])
    );
  }

  resetPresentacion = () => this.presentacion = { presentacion: null, medida: null, descripcion: null, cantidad: null, debaja: 0, fechabaja: null, usuariobaja: null };

  onSubmit = () => {
    this.endSubs.add(
      this.presentacionSrvc.save(this.presentacion).subscribe(res => {
        if (res.exito) {
          this.presentacionSavedEv.emit(res.presentacion || null);
          this.resetPresentacion();
          this.snackBar.open(res.mensaje, 'Presentación', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Presentación', { duration: 3000 });
        }
      })
    );
  }

  darDeBaja = () => {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmDialogModel(
        this.presentacion.descripcion,
        `Esto hará que ya NO se pueda usar la presentación en ningún proceso. ¿Desea continuar?`,
        'Sí',
        'No'
      )
    });

    this.endSubs.add(
      confirmRef.afterClosed().subscribe((conf: boolean) => {
        if (conf) {
          this.presentacion.debaja = 1;
          this.onSubmit();
        }
      })
    );
  }

}
