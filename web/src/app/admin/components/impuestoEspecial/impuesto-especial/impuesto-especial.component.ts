import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaImpuestoEspecialComponent } from '@admin-components/impuestoEspecial/lista-impuesto-especial/lista-impuesto-especial.component';
import { ImpuestoEspecial } from '@admin-interfaces/impuesto-especial';

@Component({
  selector: 'app-impuesto-especial',
  templateUrl: './impuesto-especial.component.html',
  styleUrls: ['./impuesto-especial.component.css']
})
export class ImpuestoEspecialComponent implements OnInit {

  public impuestoEspecial: ImpuestoEspecial;
  @ViewChild('lstImpuestoEspecial') lstImpuestoEspecial: ListaImpuestoEspecialComponent;

  constructor() {
    this.impuestoEspecial = { impuesto_especial: null, descripcion: null, porcentaje: null, descripcion_interna: null, codigo_sat: null };
  }

  ngOnInit() {
  }

  setImpuestoEspecial = (impesp: ImpuestoEspecial) => this.impuestoEspecial = impesp;

  refreshImpuestoEspecialList = () => this.lstImpuestoEspecial.loadImpuestosEspeciales();

}
