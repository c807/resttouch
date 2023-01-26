import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';
import { ConfirmDialogModel, ConfirmDialogComponent } from '@shared-components/confirm-dialog/confirm-dialog.component';

import { AnulacionService } from '@admin-services/anulacion.service';
import { RazonAnulacion } from '@admin-interfaces/razon-anulacion';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-razon-anulacion',
  templateUrl: './form-razon-anulacion.component.html',
  styleUrls: ['./form-razon-anulacion.component.css']
})
export class FormRazonAnulacionComponent implements OnInit, OnDestroy {

  @Input() razon: RazonAnulacion;
  @Output() razonAnulacionSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private anulacionSrvc: AnulacionService,
    private ls: LocalstorageService
  ) { }

  ngOnInit() {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetForm = () => this.razon = { razon_anulacion: null, descripcion: null, anulado: 0 };

  onSubmit = () => {
    if (+this.razon.anulado === 1 && +this.razon.razon_anulacion > 0) {
      const confRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: new ConfirmDialogModel('De baja',
          `Esto dará de baja la razón de anulación '${this.razon.descripcion}'. ¿Desea de continuar?`,
          'Sí', 'No')
      });
      this.endSubs.add(        
        confRef.afterClosed().subscribe(cnf => {
          if (cnf) {
            this.guardarRazon();
          }
        })
      );
    } else {
      this.guardarRazon();
    }
  }

  guardarRazon = () => {
    this.endSubs.add(      
      this.anulacionSrvc.save(this.razon).subscribe(res => {
        if (res.exito) {
          this.razonAnulacionSavedEv.emit();
          this.resetForm();
          this.snackBar.open('Razon de Anulación Guardada...', 'Razon de Anulacion', { duration: 3000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Razon de Anulacion', { duration: 3000 });
        }
      })
    );
  }

}
