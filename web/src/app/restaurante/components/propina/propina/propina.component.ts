import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaPropinaComponent } from '@restaurante-components/propina/lista-propina/lista-propina.component';
import { Propina } from '@restaurante-interfaces/propina';

@Component({
  selector: 'app-propina',
  templateUrl: './propina.component.html',
  styleUrls: ['./propina.component.css']
})
export class PropinaComponent implements OnInit {
  public propina: Propina;
  @ViewChild('lstPropina') lstPropinaComponent: ListaPropinaComponent;
  constructor() {
    this.propina = {
      propina_distribucion: null, usuario_tipo: null, porcentaje: null, anulado: null, sede: null, grupal: null
    };
  }

  ngOnInit() {
  }

  setPropina = (pres: any) => this.propina = {
    propina_distribucion: pres.propina_distribucion,
    usuario_tipo: pres.usuario_tipo.usuario_tipo,
    porcentaje: pres.porcentaje,
    anulado: pres.anulado,
    sede: pres.sede,
    grupal: pres.grupal
  }

  refreshPropinaList = () => this.lstPropinaComponent.loadPropinas();
}
