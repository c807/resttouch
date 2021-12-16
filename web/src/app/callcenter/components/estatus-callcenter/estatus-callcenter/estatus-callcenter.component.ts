import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaEstatusCallcenterComponent } from '../lista-estatus-callcenter/lista-estatus-callcenter.component';
import { EstatusCallcenter } from '../../../interfaces/estatus-callcenter';

@Component({
  selector: 'app-estatus-callcenter',
  templateUrl: './estatus-callcenter.component.html',
  styleUrls: ['./estatus-callcenter.component.css']
})
export class EstatusCallcenterComponent implements OnInit {

  public estatusCallcenter: EstatusCallcenter;
  @ViewChild('lstEstatusCallcenter') lstEstatusCallcenter: ListaEstatusCallcenterComponent;

  constructor() {
    this.estatusCallcenter = { estatus_callcenter: null, descripcion: null, color: null, orden: null };
  }

  ngOnInit(): void {
  }

  setEstatusCallcenter = (te: EstatusCallcenter) => this.estatusCallcenter = te;

  refreshCallcenter = () => this.lstEstatusCallcenter.loadEstatuscallcenter();

}
