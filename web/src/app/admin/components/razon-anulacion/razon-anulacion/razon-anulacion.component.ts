import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaRazonAnulacionComponent } from '@admin-components/razon-anulacion/lista-razon-anulacion/lista-razon-anulacion.component';
import { RazonAnulacion } from '@admin-interfaces/razon-anulacion';

@Component({
  selector: 'app-razon-anulacion',
  templateUrl: './razon-anulacion.component.html',
  styleUrls: ['./razon-anulacion.component.css']
})
export class RazonAnulacionComponent implements OnInit {

  public razon: RazonAnulacion;
  @ViewChild('lstRazon') lstRazonComponent: ListaRazonAnulacionComponent;

  constructor() { 
    this.razon = {
      razon_anulacion: null,
      descripcion: null,
      anulado: 0
    };
  }

  ngOnInit() {
  }

  setRazonAnulacion = (obj: RazonAnulacion) => this.razon = obj;
  refreshRazonList = () => this.lstRazonComponent.getRazones();

}
