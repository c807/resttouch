import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaPresentacionComponent } from '../lista-presentacion/lista-presentacion.component';
import { Presentacion } from '../../../interfaces/presentacion';

@Component({
  selector: 'app-presentacion',
  templateUrl: './presentacion.component.html',
  styleUrls: ['./presentacion.component.css']
})
export class PresentacionComponent implements OnInit {

  public presentacion: Presentacion;
  @ViewChild('lstPresentacion') lstMedidaComponent: ListaPresentacionComponent;

  constructor() {
    this.presentacion = {
      presentacion: null, medida: null, descripcion: null, cantidad: null, debaja: 0, fechabaja: null, usuariobaja: null
    };
  }

  ngOnInit() {
  }

  setPresentacion = (pres: any) => this.presentacion = {
    presentacion: pres.presentacion,
    medida: pres.medida.medida,
    descripcion: pres.descripcion,
    cantidad: pres.cantidad,
    debaja: pres.debaja,
    fechabaja: pres.fechabaja,
    usuariobaja: pres.usuariobaja
  };

  refreshPresentacionList = () => this.lstMedidaComponent.loadPresentaciones();

}
