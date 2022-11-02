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

  get tresFaltante() {
    return (tares: TarifaReserva) => (tares.cantidad_adultos === null || tares.cantidad_adultos === undefined) || (tares.cantidad_menores === null || tares.cantidad_menores === undefined) || (tares.monto === null || tares.monto === undefined);
  }

  get tarifaReservaFaltante(): boolean {
    return (this.tarifaReserva.cantidad_adultos === null || this.tarifaReserva.cantidad_adultos === undefined) || (this.tarifaReserva.cantidad_menores === null || this.tarifaReserva.cantidad_menores === undefined) || (this.tarifaReserva.monto === null || this.tarifaReserva.monto === undefined);
  }

  public tipoHabitacion: TipoHabitacion;
  public tarifasReserva: TarifaReserva[] = [];
  public tarifaReserva: TarifaReserva;
  public cargando = false;

  private endSubs = new Subscription();

  constructor(
    private tarifaReservaSrvc: TarifaReservaService
  ) { }

  ngOnInit(): void {
    this.resetTarifaReserva();
  }

  ngOnDestroy(): void {
    this.endSubs.unsubscribe();
  }

  resetTarifaReserva = () => {
    this.tarifaReserva = {
      tarifa_reserva: null,
      tipo_habitacion: this.tipoHabitacion?.tipo_habitacion || null,
      cantidad_adultos: null,
      cantidad_menores: null,
      monto: null,
      monto_adicional_adulto: 0,
      monto_adicional_menor: 0
    }
  }

  loadTarifasReserva = (fltr: any = {}) => {
    this.cargando = true;
    if (this.tipoHabitacion && +this.tipoHabitacion.tipo_habitacion > 0) {
      fltr.tipo_habitacion = +this.tipoHabitacion.tipo_habitacion;
    }
    this.endSubs.add(
      this.tarifaReservaSrvc.get(fltr).subscribe(res => {
        this.tarifasReserva = res;
        this.cargando = false;
      })
    );
  }

  guardarTarifa = (tr: TarifaReserva) => {
    this.cargando = true;
    this.endSubs.add(
      this.tarifaReservaSrvc.save(tr).subscribe(res => {
        this.resetTarifaReserva();
        this.loadTarifasReserva();        
      })
    );
  }
}
