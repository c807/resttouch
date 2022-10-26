import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaTipoHabitacionComponent } from '../lista-tipo-habitacion/lista-tipo-habitacion.component';
import { TipoHabitacion } from '../../../interfaces/tipo-habitacion';

@Component({
  selector: 'app-tipo-habitacion',
  templateUrl: './tipo-habitacion.component.html',
  styleUrls: ['./tipo-habitacion.component.css']
})
export class TipoHabitacionComponent implements OnInit {

  public tipoHabitacion: TipoHabitacion;
  @ViewChild('lstTipoHabitacion') lstTipoHabitacion: ListaTipoHabitacionComponent;

  constructor() {
    this.tipoHabitacion = { tipo_habitacion: null, descripcion: null, icono: null }
  }

  ngOnInit(): void {
  }

  setTipoHabitacion = (th: TipoHabitacion) => this.tipoHabitacion = th;

  refreshTipoHabitacionList = () => this.lstTipoHabitacion.loadTiposHabitacion();

}
