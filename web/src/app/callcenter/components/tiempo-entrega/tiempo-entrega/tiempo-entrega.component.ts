import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaTiempoEntregaComponent } from '../lista-tiempo-entrega/lista-tiempo-entrega.component';
import { TiempoEntrega } from '../../../interfaces/tiempo-entrega';

@Component({
  selector: 'app-tiempo-entrega',
  templateUrl: './tiempo-entrega.component.html',
  styleUrls: ['./tiempo-entrega.component.css']
})
export class TiempoEntregaComponent implements OnInit {

  public tiempoEntrega: TiempoEntrega;
  @ViewChild('lstTiempoEntrega') lstTiempoEntrega: ListaTiempoEntregaComponent;

  constructor() {
    this.tiempoEntrega = { tiempo_entrega: null, descripcion: null, orden: null };
  }

  ngOnInit(): void {
  }

  setTiempoEntrega = (te: TiempoEntrega) => this.tiempoEntrega = te;

  refreshTiempoEntrega = () => this.lstTiempoEntrega.loadTiemposEntrega();

}
