import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaTipoDomicilioComponent } from '@callcenter-components/tipo-domicilio/lista-tipo-domicilio/lista-tipo-domicilio.component';
import { TipoDomicilio } from '@callcenter-interfaces/tipo-domicilio';

@Component({
  selector: 'app-tipo-domicilio',
  templateUrl: './tipo-domicilio.component.html',
  styleUrls: ['./tipo-domicilio.component.css']
})
export class TipoDomicilioComponent implements OnInit {

  public tipoDomicilio: TipoDomicilio;
  @ViewChild('lstTipoDomicilio') lstTipoDomicilio: ListaTipoDomicilioComponent;

  constructor() {
    this.tipoDomicilio = { tipo_domicilio: null, descripcion: null };
  }

  ngOnInit(): void {
  }

  setTipoDomicilio = (td: TipoDomicilio) => this.tipoDomicilio = td;

  refreshTipoDomicilio = () => this.lstTipoDomicilio.loadTiposDomicilio();

}
