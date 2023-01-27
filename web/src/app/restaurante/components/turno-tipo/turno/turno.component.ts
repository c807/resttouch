import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaTurnoTipoComponent } from '@restaurante-components/turno-tipo/lista-turno/lista-turno.component';
import { TipoTurno } from '@restaurante-interfaces/tipo-turno';

@Component({
  selector: 'app-turno-tipo',
  templateUrl: './turno.component.html',
  styleUrls: ['./turno.component.css']
})
export class TurnoTipoComponent implements OnInit {

  public turno: TipoTurno;
  @ViewChild('lstTurno') lstTurnoComponent: ListaTurnoTipoComponent;

  constructor() {
    this.turno = { 
      turno_tipo: null,
      descripcion: null,
      activo:1,
      enviar_reporte: 0,
      correo_cierre: null,
      bodega: null
    };
  }

  ngOnInit() {
  }

  setTurno = (cli: TipoTurno) => this.turno = cli;

  refreshTurnoList = () => this.lstTurnoComponent.loadTurnos();

}
