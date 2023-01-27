import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaRepartidorComponent } from '@callcenter-components/repartidor/lista-repartidor/lista-repartidor.component';
import { Repartidor } from '@callcenter-interfaces/repartidor';

@Component({
  selector: 'app-repartidor',
  templateUrl: './repartidor.component.html',
  styleUrls: ['./repartidor.component.css']
})
export class RepartidorComponent implements OnInit {

  public repartidor: Repartidor;
  @ViewChild('lstRepartidores') lstRepartidores: ListaRepartidorComponent;

  constructor() {
    this.repartidor = { repartidor: null, nombre: null, debaja: 0 };
  }

  ngOnInit(): void {
  }

  setRepartidor = (td: Repartidor) => this.repartidor = td;

  refreshRepartidores = () => this.lstRepartidores.loadRepartidores();

}
