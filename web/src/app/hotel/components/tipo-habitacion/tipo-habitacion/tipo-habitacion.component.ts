import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaTipoHabitacionComponent } from '@hotel-components/tipo-habitacion/lista-tipo-habitacion/lista-tipo-habitacion.component';
import { FormTipoHabitacionComponent } from '@hotel-components/tipo-habitacion/form-tipo-habitacion/form-tipo-habitacion.component';
import { TipoHabitacion } from '@hotel-interfaces/tipo-habitacion';

@Component({
  selector: 'app-tipo-habitacion',
  templateUrl: './tipo-habitacion.component.html',
  styleUrls: ['./tipo-habitacion.component.css']
})
export class TipoHabitacionComponent implements OnInit {

  public tipoHabitacion: TipoHabitacion;
  @ViewChild('lstTipoHabitacion') lstTipoHabitacion: ListaTipoHabitacionComponent;
  @ViewChild('frmTipoHabitacion') frmTipoHabitacion: FormTipoHabitacionComponent;

  constructor() {
    this.tipoHabitacion = { tipo_habitacion: null, descripcion: null, icono: null }
  }

  ngOnInit(): void {
  }

  setTipoHabitacion = (th: TipoHabitacion) => {
    this.tipoHabitacion = th
    this.frmTipoHabitacion.tipoHabitacion = this.tipoHabitacion;    
    this.frmTipoHabitacion.lstTarifaReserva.tipoHabitacion = this.tipoHabitacion;
    this.frmTipoHabitacion.lstTarifaReserva.resetTarifaReserva();
    this.frmTipoHabitacion.lstTarifaReserva.loadTarifasReserva();
  };

  refreshTipoHabitacionList = () => this.lstTipoHabitacion.loadTiposHabitacion();

}