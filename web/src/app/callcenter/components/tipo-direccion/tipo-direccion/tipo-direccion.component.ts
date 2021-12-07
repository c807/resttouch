import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaTipoDireccionComponent } from '../lista-tipo-direccion/lista-tipo-direccion.component';
import { TipoDireccion } from '../../../interfaces/tipo-direccion';

@Component({
  selector: 'app-tipo-direccion',
  templateUrl: './tipo-direccion.component.html',
  styleUrls: ['./tipo-direccion.component.css']
})
export class TipoDireccionComponent implements OnInit {

  public tipoDireccion: TipoDireccion;
  @ViewChild('lstTipoDireccion') lstTipoDireccion: ListaTipoDireccionComponent;

  constructor() {
    this.tipoDireccion = { tipo_direccion: null, descripcion: null };
  }

  ngOnInit(): void {
  }

  setTipoDireccion = (td: TipoDireccion) => this.tipoDireccion = td;

  refreshTipoDireccion = () => this.lstTipoDireccion.loadTiposDireccion();

}
