import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../services/localstorage.service';

import { TipoHabitacion } from '../../../interfaces/tipo-habitacion';
import { TipoHabitacionService } from '../../../services/tipo-habitacion.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-tipo-habitacion',
  templateUrl: './form-tipo-habitacion.component.html',
  styleUrls: ['./form-tipo-habitacion.component.css']
})
export class FormTipoHabitacionComponent implements OnInit, OnDestroy {

  @Input() tipoHabitacion: TipoHabitacion;
  @Output() tipoHabitacionSavedEv = new EventEmitter();
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;

  private endSubs = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private tipoHabitacionSrvc: TipoHabitacionService,
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.esMovil = this.ls.get(GLOBAL.usrTokenVar).enmovil || false;
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();    
  }

  resetTipoHabitacion() {
    this.tipoHabitacion = { tipo_habitacion: null, descripcion: null, icono: null };
  }

  onSubmit() {
    this.endSubs.add(      
      this.tipoHabitacionSrvc.save(this.tipoHabitacion).subscribe((res) => {
        if (res) {
          this.resetTipoHabitacion();
          this.tipoHabitacionSavedEv.emit();
          this.snackBar.open('Grabado con éxito.', 'Tipo de habitación', { duration: 5000 });
        }
      })
    );
  }

}
