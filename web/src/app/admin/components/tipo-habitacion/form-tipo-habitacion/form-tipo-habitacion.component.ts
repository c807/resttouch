import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GLOBAL } from '../../../../shared/global';
import { LocalstorageService } from '../../../services/localstorage.service';

import { TipoHabitacion } from '../../../interfaces/tipo-habitacion';
import { TipoHabitacionService } from '../../../services/tipo-habitacion.service';

import { TarifaReservaComponent } from '../../../../hotel/components/tarifa-reserva/tarifa-reserva/tarifa-reserva.component';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-tipo-habitacion',
  templateUrl: './form-tipo-habitacion.component.html',
  styleUrls: ['./form-tipo-habitacion.component.css']
})
export class FormTipoHabitacionComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() tipoHabitacion: TipoHabitacion;
  @Output() tipoHabitacionSavedEv = new EventEmitter();
  @ViewChild('lstTarifaReserva') lstTarifaReserva: TarifaReservaComponent;
  public keyboardLayout = GLOBAL.IDIOMA_TECLADO;
  public esMovil = false;
  public iconos = ['home', 'apartment', 'maps_home_work', 'business', 'location_city', 'cottage', 'villa', 'house_siding', 'bungalow', 'chalet', 'gite', 'domain', 'fireplace'];

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

  ngAfterViewInit(): void {
    // console.log(this.lstTarifaReserva);
  }

  resetTipoHabitacion() {
    this.tipoHabitacion = { tipo_habitacion: null, descripcion: null, icono: null };
    this.lstTarifaReserva.tipoHabitacion = null;
    this.lstTarifaReserva.resetTarifaReserva();
    this.lstTarifaReserva.tarifasReserva = [];    
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
