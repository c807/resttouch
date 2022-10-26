import { Component, OnInit, OnDestroy } from '@angular/core';

import { TipoHabitacion } from '../../../../admin/interfaces/tipo-habitacion';
import { TipoHabitacionService } from '../../../../admin/services/tipo-habitacion.service';
import { TarifaReserva } from '../../../interfaces/tarifa-reserva';
import { TarifaReservaService } from '../../../services/tarifa-reserva.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tarifa-reserva',
  templateUrl: './tarifa-reserva.component.html',
  styleUrls: ['./tarifa-reserva.component.css']
})
export class TarifaReservaComponent implements OnInit, OnDestroy {

  public tipoHabitacion: TipoHabitacion;

  private endSubs = new Subscription();

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

}
