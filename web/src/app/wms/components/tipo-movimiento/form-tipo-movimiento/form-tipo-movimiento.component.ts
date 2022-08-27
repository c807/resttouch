import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../../admin/services/localstorage.service';

import { TipoMovimiento } from '../../../interfaces/tipo-movimiento';
import { TipoMovimientoService } from '../../../services/tipo-movimiento.service';

@Component({
  selector: 'app-form-tipo-movimiento',
  templateUrl: './form-tipo-movimiento.component.html',
  styleUrls: ['./form-tipo-movimiento.component.css']
})
export class FormTipoMovimientoComponent implements OnInit {

  @Input() tipoMovimiento: TipoMovimiento;
  @Output() tipoMovimientoSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  constructor(
    private snackBar: MatSnackBar,
    private tipoMovimientoSrvc: TipoMovimientoService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  resetTipoMovimiento() {
    this.tipoMovimiento = { tipo_movimiento: null, descripcion: null, ingreso: 0, egreso: 0, requisicion: 0 };
  }

  onSubmit() {
    this.tipoMovimientoSrvc.save(this.tipoMovimiento).subscribe((res) => {
      if (res.exito) {
        this.resetTipoMovimiento();
        this.tipoMovimientoSavedEv.emit();
        this.snackBar.open('Grabado con éxito.', 'Tipo de movimiento', { duration: 5000 });
      } else {
        this.snackBar.open(`ERROR: ${res.mensaje}`, 'Tipo de movimiento', { duration: 7000 });        
      }
    });
  }  

}
