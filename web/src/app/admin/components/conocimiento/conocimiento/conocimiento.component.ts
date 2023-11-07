import { Component, OnInit, ViewChild } from '@angular/core';

import { ListaConocimientoComponent } from '@admin-components/conocimiento/lista-conocimiento/lista-conocimiento.component';
import { FormConocimientoComponent } from '@admin-components/conocimiento/form-conocimiento/form-conocimiento.component';
import { Conocimiento } from '@admin-interfaces/conocimiento';

@Component({
  selector: 'app-conocimiento',
  templateUrl: './conocimiento.component.html',
  styleUrls: ['./conocimiento.component.css']
})
export class ConocimientoComponent implements OnInit {

  public conocimiento: Conocimiento;
  @ViewChild('lstConocimiento') lstConocimiento: ListaConocimientoComponent;
  @ViewChild('frmConocimiento') frmConocimiento: FormConocimientoComponent;

  constructor() {
    this.conocimiento = {
      conocimiento: null, asunto: null, resumen: null
    }
  }

  ngOnInit(): void { }

  setConocimiento = (knowledge: Conocimiento) => {
    this.frmConocimiento.resetConocimiento();
    this.conocimiento = knowledge;
    this.frmConocimiento.conocimiento = { ...this.conocimiento };
  };

  refreshConocimientoList = () => this.lstConocimiento.loadConocimiento();

}
