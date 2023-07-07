import { Component, OnInit, ViewChild } from '@angular/core';
import { LocalstorageService } from '@admin/services/localstorage.service';
import { GLOBAL } from '@shared/global';
import * as moment from 'moment';

import { ListaAjusteCostoPromedioComponent } from '@wms-components/ajuste-costo-promedio/lista-ajuste-costo-promedio/lista-ajuste-costo-promedio.component';
import { FormAjusteCostoPromedioComponent } from '@wms-components/ajuste-costo-promedio/form-ajuste-costo-promedio/form-ajuste-costo-promedio.component';
import { AjusteCostoPromedio } from '@wms-interfaces/ajuste-costo-promedio';

@Component({
  selector: 'app-ajuste-costo-promedio',
  templateUrl: './ajuste-costo-promedio.component.html',
  styleUrls: ['./ajuste-costo-promedio.component.css']
})
export class AjusteCostoPromedioComponent implements OnInit {

  get sedeActual(): number {
    return this.ls.get(GLOBAL.usrTokenVar).sede as number;
  }

  get usuarioActual(): number {
    return this.ls.get(GLOBAL.usrTokenVar).idusr as number;
  }

  get usaCostoPromedio(): boolean {
    return ((this.ls.get(GLOBAL.usrTokenVar).empresa.metodo_costeo as number) || 0) === 2;
  }

  public ajusteCostoPromedio: AjusteCostoPromedio;
  @ViewChild('lstAjusteCostoPromedio') lstAjusteCostoPromedio: ListaAjusteCostoPromedioComponent;
  @ViewChild('frmAjusteCostoPromedio') frmAjusteCostoPromedio: FormAjusteCostoPromedioComponent;

  constructor(
    private ls: LocalstorageService
  ) { }

  ngOnInit(): void {
    this.ajusteCostoPromedio = {
      ajuste_costo_promedio: null,
      sede: this.sedeActual,
      usuario: this.usuarioActual,
      categoria_grupo: null,
      bodega: null,
      fecha: moment().format(GLOBAL.dbDateFormat),
      notas: null,
      confirmado: 0
    }
  }

  setAjusteCostoPromedio = (acp: AjusteCostoPromedio) => {
    this.frmAjusteCostoPromedio.resetAjusteCostoPromedio();
    this.ajusteCostoPromedio = acp;
    this.frmAjusteCostoPromedio.ajusteCostoPromedio = this.ajusteCostoPromedio;
    this.frmAjusteCostoPromedio.loadBodegas({ sede: this.ajusteCostoPromedio.sede });
    this.frmAjusteCostoPromedio.loadCategorias({ sede: this.ajusteCostoPromedio.sede });
    this.frmAjusteCostoPromedio.loadArticulos({ sede: this.ajusteCostoPromedio.sede });

    if (+this.ajusteCostoPromedio.categoria_grupo > 0) {
      this.ajusteCostoPromedio.categoria_grupo = +this.ajusteCostoPromedio.categoria_grupo;
      this.frmAjusteCostoPromedio.loadSubCategorias(+this.ajusteCostoPromedio.categoria);
    }

    this.frmAjusteCostoPromedio.loadDetalleAjusteCostoPromedio(this.ajusteCostoPromedio.ajuste_costo_promedio);
  }

  refreshAjusteCostoPromedioList = () => {
    this.lstAjusteCostoPromedio.loadAjustesCostoPromedio();
  }
}
