import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { GLOBAL } from '@shared/global';
import { LocalstorageService } from '@admin-services/localstorage.service';

import { TipoMovimiento } from '@wms-interfaces/tipo-movimiento';
import { TipoMovimientoService } from '@wms-services/tipo-movimiento.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-tipo-movimiento',
  templateUrl: './form-tipo-movimiento.component.html',
  styleUrls: ['./form-tipo-movimiento.component.css']
})
export class FormTipoMovimientoComponent implements OnInit, OnDestroy {

  @Input() tipoMovimiento: TipoMovimiento;
  @Output() tipoMovimientoSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public empresaMetodoCosteo = 0;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private tipoMovimientoSrvc: TipoMovimientoService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
    this.empresaMetodoCosteo = (this.ls.get(GLOBAL.usrTokenVar).empresa.metodo_costeo as number) || 0;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetTipoMovimiento() {
    this.tipoMovimiento = { tipo_movimiento: null, descripcion: null, ingreso: 0, egreso: 0, requisicion: 0, esajuste_cp: 0 };
  }

  onSubmit() {
    this.endSubs.add(      
      this.tipoMovimientoSrvc.save(this.tipoMovimiento).subscribe((res) => {
        if (res.exito) {
          this.resetTipoMovimiento();
          this.tipoMovimientoSavedEv.emit();
          this.snackBar.open('Grabado con éxito.', 'Tipo de movimiento', { duration: 5000 });
        } else {
          this.snackBar.open(`ERROR: ${res.mensaje}`, 'Tipo de movimiento', { duration: 7000 });        
        }
      })
    );
  }  

  chgEsRequisicion = (obj: MatCheckboxChange) => this.tipoMovimiento.egreso = obj.checked ? 1 : 0;

}
