import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaConocimientoComponent } from '@admin-components/conocimiento/lista-conocimiento/lista-conocimiento.component'
import { Conocimiento } from '@admin-interfaces/conocimiento';

@Component({
  selector: 'app-conocimiento',
  templateUrl: './conocimiento.component.html',
  styleUrls: ['./conocimiento.component.css']
})
export class ConocimientoComponent implements OnInit {

  public conocimiento: Conocimiento;
  @ViewChild('lstConocimiento') lstConocimiento: ListaConocimientoComponent;

  constructor() {
    this.conocimiento = {
      conocimiento: null, asunto: null, resumen: null
    }
  }

  ngOnInit(): void { }

  setConocimiento = (knowledge: Conocimiento) => { this.conocimiento = knowledge };

  refreshConocimientoList = () => this.lstConocimiento.loadConocimiento();

}
